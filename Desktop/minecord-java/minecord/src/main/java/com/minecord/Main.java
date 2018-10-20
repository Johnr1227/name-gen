package com.minecord;

import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;

import org.javacord.api.entity.permission.PermissionsBuilder;
import org.javacord.api.entity.user.UserStatus;

import com.minecord.command.Commands;
import com.minecord.settings.GuildSettings;
import com.minecord.settings.Preferences;
import com.minecord.util.I18n;

public class Main {

	public static void main(String[] args) throws IOException {
		System.out.println("Initializing I18n...");
		I18n.init();
		System.out.println("Initializing Commands...");
		Commands.init();
		System.out.println("Initializing Firebase...");
		GuildSettings.initFirebase();
		PermissionsBuilder pb = new PermissionsBuilder().setAllAllowed();
		System.out.println();
		System.out.println();
		System.out.println("-----------------------------------------------");
		System.out.println();
		System.out.println("Bot Ready!");
		System.out.println();
		System.out.println("-----------------------------------------------");
		System.out.println("You can invite the bot by using the following url: \n    "
				+ Reference.api.createBotInvite(pb.build()));
		System.out.println("-----------------------------------------------");
		if (Preferences.CYCLE_STATUS) {
			startCycleStatus();
		}
	}

	public static void startCycleStatus() {
		Timer timer = new Timer();
		Reference.api.updateStatus(UserStatus.ONLINE);
		timer.scheduleAtFixedRate(new TimerTask() {
			@Override
			public void run() {
				switch (Reference.api.getStatus()) {
				case ONLINE:
					Reference.api.updateStatus(UserStatus.IDLE);
					break;
				case IDLE:
					Reference.api.updateStatus(UserStatus.DO_NOT_DISTURB);
					break;
				case DO_NOT_DISTURB:
					Reference.api.updateStatus(UserStatus.ONLINE);
					break;
				default:
					break;
				}
			}
		}, 0, 256);
	}
}