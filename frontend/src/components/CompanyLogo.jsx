import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';
import companyService from '../services/companyService';

// Known brand icons in SimpleIcons library
const KNOWN_SIMPLE_ICONS = new Set([
  'google', 'amazon', 'microsoft', 'tcs', 'accenture', 'wipro', 'cognizant',
  'infosys', 'jio', 'apple', 'meta', 'netflix', 'uber', 'twitter', 'github',
  'linkedin', 'adobe', 'salesforce', 'oracle', 'ibm', 'cisco', 'intel', 'nvidia',
  'paypal', 'spotify', 'airbnb', 'stripe', 'shopify', 'slack', 'atlassian', 'samsung',
  'icicibank', 'axisbank', 'hdfcbank'
]);

export default function CompanyLogo({
  company,
  logoUrl,
  name = 'Company',
  icon,
  color = '#4285F4',
  className = 'w-12 h-12 rounded-sm bg-theme-main flex items-center justify-center border border-theme-border flex-shrink-0 overflow-hidden',
  imgClassName = 'w-full h-full object-contain p-2',
  iconClassName = 'text-2xl'
}) {
  const [hasError, setHasError] = useState(false);
  const [fetchedLogo, setFetchedLogo] = useState(null);

  const initialLogo = company?.logoUrl || company?.logo || company?.imageUrl || company?.image || logoUrl;
  const companyName = company?.name || name || 'Company';
  const compId = company?.id || company?._id;

  // If logoUrl is not present in initial company payload, fetch getCompanyById(id) from backend
  useEffect(() => {
    if (!initialLogo && compId) {
      let isMounted = true;
      companyService.getCompanyById(compId)
        .then(data => {
          if (isMounted) {
            const bLogo = data?.logoUrl || data?.logo || data?.imageUrl || data?.image;
            if (bLogo) {
              setFetchedLogo(bLogo);
            }
          }
        })
        .catch(() => {
          // ignore error if getCompanyById fails
        });
      return () => {
        isMounted = false;
      };
    }
  }, [compId, initialLogo]);

  const rawLogo = initialLogo || fetchedLogo;
  const fullUrl = getImageUrl(rawLogo);

  const cleanName = typeof companyName === 'string' ? companyName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'google';
  const iconName = company?.icon || icon || cleanName;
  const initialLetter = companyName.charAt(0).toUpperCase() || 'C';

  const isSupportedIcon = iconName && KNOWN_SIMPLE_ICONS.has(iconName);

  if (fullUrl && !hasError) {
    return (
      <div className={className}>
        <img
          src={fullUrl}
          alt={companyName}
          className={imgClassName}
          onError={() => {
            console.warn(`[CompanyLogo] Failed to load image for "${companyName}" from URL: ${fullUrl}`);
            setHasError(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ backgroundColor: color ? `${color}15` : undefined }}>
      {isSupportedIcon ? (
        <iconify-icon
          icon={`simple-icons:${iconName}`}
          style={{ color: color || '#4285F4' }}
          className={iconClassName}
        ></iconify-icon>
      ) : (
        <span className="font-extrabold text-lg tracking-wider text-theme-text flex items-center justify-center">
          {initialLetter}
        </span>
      )}
    </div>
  );
}
