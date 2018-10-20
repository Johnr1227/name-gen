package com.minecord.util;

import java.util.Locale;
import java.util.ResourceBundle;

public class I18n {

	private static String lang;
	private static ResourceBundle labels;
	private static Locale locale;

	public static void init() {
		setLanguage("en_US");
	}

	public static void setLanguage(String lang) {
		if (lang != I18n.lang) {
			I18n.lang = lang;

			locale = new Locale(lang);
			labels = ResourceBundle.getBundle("assets.minecord.lang.minecord", locale);
			System.out.println("Set language to " + lang);
		}
	}

	public static void setLanguage(String lang, String country) {
		if (I18n.lang != lang + '_' + country) {
			locale = new Locale(lang, country);
			labels = ResourceBundle.getBundle("assets.minecord.lang.minecord", locale);
			System.out.println("Set language to " + lang + "_" + country);
		}
	}

	public static String format(String string) {
		return labels.getString(string);
	}
}
