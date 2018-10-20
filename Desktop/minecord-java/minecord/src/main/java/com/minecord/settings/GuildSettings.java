package com.minecord.settings;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.minecord.util.PermissionLevel;

public class GuildSettings {
	public static FirebaseDatabase database;

	private static FileInputStream serviceAccount;
	private static FirebaseOptions options;

	private static HashMap<String, Object> defaultSettings = new HashMap<>();

	/**
	 * run through all the steps required to initialize my firebase database.
	 */
	public static void initFirebase() throws IOException {
		serviceAccount = new FileInputStream("src/main/resources/serviceAccountKey.json");

		options = new FirebaseOptions.Builder()
				.setCredentials(GoogleCredentials.fromStream(serviceAccount))
				.setDatabaseUrl("https://craftbot-is-coolio.firebaseio.com").build();

		FirebaseApp.initializeApp(options);
		database = FirebaseDatabase.getInstance();

		defaultSettings.put("language", "en_US");
		defaultSettings.put("prefix", ";");

		HashMap<String, PermissionLevel> permissionLevels = new HashMap<>();
		HashMap<String, String> peasant = new HashMap<>();
		HashMap<String, String> moderator = new HashMap<>();
		HashMap<String, String> admin = new HashMap<>();

		peasant.put("0", "help");
		peasant.put("1", "ping");

		moderator.put("0", "help");
		moderator.put("1", "ping");
		moderator.put("2", "firebase");

		admin.put("0", "help");
		admin.put("1", "ping");
		admin.put("2", "firebase");
		admin.put("3", "exit");

		permissionLevels.put("peasant", new PermissionLevel(0, peasant));

		permissionLevels.put("moderator", new PermissionLevel(1, moderator));

		permissionLevels.put("admin", new PermissionLevel(2, admin));

		defaultSettings.put("permissionLevels", permissionLevels);
	}

	/**
	 * set __ to __ in my database
	 * 
	 * @param key
	 *            the key to set in my db.
	 * @param value
	 *            the value to set that key to.
	 */
	public static void set(String key, Object value) {
		database.getReference(key).setValueAsync(value);
	}

	/**
	 * set __/__ to __ in my database
	 * 
	 * @param mapKey
	 *            the key of the map in my db
	 * @param key
	 *            the key to set inside of that map
	 * @param value
	 *            the value to set that key to
	 */
	public static void set(String mapKey, String key, Object value) {
		database.getReference(mapKey).child(key).setValueAsync(value);
	}

	/**
	 * 
	 * Usage:
	 * 
	 * <pre>
	 * GuildSettings.get(guildID)
	 * 		.thenAcceptAsync(data -> {
	 * 			// some code here, data
	 * 			// being the value you want to get
	 * 		});
	 * </pre>
	 * 
	 * @param key
	 *            the guild ID of the server you want the settings of
	 * 
	 * @return a CompletableFuture that will return a HashMap with the key being
	 *         a String and the value an Object.
	 * 
	 */
	public static CompletableFuture<HashMap<String, Object>> get(String key) {
		CompletableFuture<HashMap<String, Object>> cf = new CompletableFuture<>();
		database.getReference(key).addListenerForSingleValueEvent(new ValueEventListener() {
			@Override
			@SuppressWarnings("unchecked")
			public void onDataChange(DataSnapshot val) {
				if (val.exists()) {
					HashMap<String, Object> value = (HashMap<String, Object>) (val.getValue());
					cf.complete(value);
				} else {
					System.out.println("Initializing settings of " + key);
					GuildSettings.set(key, defaultSettings);
					cf.complete(defaultSettings);
				}
			}

			@Override
			public void onCancelled(DatabaseError arg0) {
				System.out.println("Cancelled");
				cf.completeExceptionally(arg0.toException());
			}
		});
		return cf;
	}

	/**
	 * 
	 * Usage:
	 * 
	 * <pre>
	 * GuildSettings.get(guildID, setting)
	 * 		.thenAcceptAsync(data -> {
	 * 			// some code here, data
	 * 			// being the value you want to get
	 * 		});
	 * </pre>
	 * 
	 * @param guildKey
	 *            the guild ID of the server you want the settings of
	 * @param key
	 *            the setting you want to get from that server
	 *            ("language","prefix", etc)
	 * 
	 * @return a CompletableFuture that will return an Object of whatever is
	 *         stored at that key of the server's settings.
	 * 
	 */
	public static CompletableFuture<Object> get(String guildKey, String key) {
		CompletableFuture<Object> cf = new CompletableFuture<>();
		database.getReference(guildKey + '/' + key).addListenerForSingleValueEvent(new ValueEventListener() {
			@Override
			public void onDataChange(DataSnapshot val) {
				if (val.exists()) {
					cf.complete(val.getValue());
				} else {
					System.out.println("Initializing settings of " + guildKey);
					GuildSettings.set(guildKey, defaultSettings);
					cf.complete(defaultSettings.get(key));
				}
			}

			@Override
			public void onCancelled(DatabaseError arg0) {
				cf.completeExceptionally(arg0.toException());
			}
		});
		return cf;
	}

	/**
	 * I honestly have no clue what this does just don't use it mk?
	 * 
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @deprecated
	 */
	public static FileInputStream getServiceAccount() {
		return serviceAccount;
	}

	/**
	 * I have no clue what a service account is just please don't mess with it.
	 * 
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @\u0002deprecated
	 * @deprecated
	 */
	public static void setServiceAccount(FileInputStream serviceAccount) {
		GuildSettings.serviceAccount = serviceAccount;
	}

	/**
	 * not quite sure what you want these for, but ok.
	 */
	public static FirebaseOptions getOptions() {
		return options;
	}
}