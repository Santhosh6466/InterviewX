package com.interviewx.backend.migration;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.InsertManyOptions;
import com.mongodb.client.model.ReplaceOptions;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

public class MongoDataMigrator {

    private static final String LOCAL_URI = "mongodb://localhost:27017";
    private static final String ATLAS_URI = "mongodb+srv://interviewx45_db_user:XMxEQeAEzPCDvV6r@cluster0.rt5obto.mongodb.net/interviewx?retryWrites=true&w=majority&appName=Cluster0";
    private static final String TARGET_DB_NAME = "interviewx";

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("  STARTING MONGODB LOCAL -> ATLAS MIGRATION      ");
        System.out.println("=================================================");

        try (MongoClient localClient = MongoClients.create(LOCAL_URI);
             MongoClient atlasClient = MongoClients.create(ATLAS_URI)) {

            MongoDatabase atlasDb = atlasClient.getDatabase(TARGET_DB_NAME);

            // Check which local databases exist
            List<String> dbsToMigrate = new ArrayList<>();
            for (String dbName : localClient.listDatabaseNames()) {
                if (dbName.equalsIgnoreCase("test") || dbName.equalsIgnoreCase("interviewx")) {
                    dbsToMigrate.add(dbName);
                }
            }

            if (dbsToMigrate.isEmpty()) {
                System.out.println("[WARN] No 'test' or 'interviewx' databases found on localhost:27017.");
                System.out.println("Available local databases:");
                for (String dbName : localClient.listDatabaseNames()) {
                    System.out.println(" - " + dbName);
                }
                return;
            }

            int totalCollectionsMigrated = 0;
            long totalDocumentsMigrated = 0;

            for (String sourceDbName : dbsToMigrate) {
                System.out.println("\n[INFO] Inspecting local database: " + sourceDbName);
                MongoDatabase sourceDb = localClient.getDatabase(sourceDbName);

                for (String collName : sourceDb.listCollectionNames()) {
                    if (collName.startsWith("system.")) continue;

                    MongoCollection<Document> sourceColl = sourceDb.getCollection(collName);
                    MongoCollection<Document> targetColl = atlasDb.getCollection(collName);

                    List<Document> docs = new ArrayList<>();
                    for (Document doc : sourceColl.find()) {
                        docs.add(doc);
                    }

                    if (docs.isEmpty()) {
                        System.out.println("  - Collection '" + collName + "' is empty. Skipping.");
                        continue;
                    }

                    System.out.println("  - Migrating '" + collName + "' (" + docs.size() + " documents) to Atlas '" + TARGET_DB_NAME + "." + collName + "'...");

                    int upserted = 0;
                    for (Document doc : docs) {
                        try {
                            Object id = doc.get("_id");
                            if (id != null) {
                                targetColl.replaceOne(new Document("_id", id), doc, new ReplaceOptions().upsert(true));
                            } else {
                                targetColl.insertOne(doc);
                            }
                            upserted++;
                        } catch (Exception e) {
                            System.err.println("    [ERROR] Failed to migrate document: " + e.getMessage());
                        }
                    }

                    totalCollectionsMigrated++;
                    totalDocumentsMigrated += upserted;
                    System.out.println("    [SUCCESS] Migrated " + upserted + "/" + docs.size() + " documents into Atlas.");
                }
            }

            System.out.println("\n=================================================");
            System.out.println("  MIGRATION COMPLETED SUCCESSFULLY!              ");
            System.out.println("  Total Collections Migrated: " + totalCollectionsMigrated);
            System.out.println("  Total Documents Migrated:   " + totalDocumentsMigrated);
            System.out.println("=================================================");

        } catch (Exception e) {
            System.err.println("[FATAL] Migration failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
