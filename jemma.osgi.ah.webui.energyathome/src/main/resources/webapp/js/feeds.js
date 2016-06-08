/**
 * Feeds Management
 * 
 * FIXME: most of the code here should be moved in a lib.
 */

Feeds = {};

Feeds.Initfeed = function(channel) {
	var feed;

	/* Se i feed sono giˆ stati caricati non viene inoltrata un altra richiesta */
	if (channel == 0 && Feeds.notizie.length != 0) {
		Feeds.caricafeed();
	} else {
		/*
		 * Questa funzione viene richiamata un numero di volte pari al numero di
		 * canali che si vuole caricare e qui si differenzia il feed da caricare
		 * in base al canale
		 */
		switch (channel) {
		case 0: {
			feed = new google.feeds.Feed("http://energyhomenews.wordpress.com/feed/ ");
			break;
		}
		case 1: {
			feed = new google.feeds.Feed("http://www.rsspect.com/rss/energyathome.xml ");
			break;
		}
		default:
			break;
		}
		feed.setNumEntries(10);

		/*
		 * Una volta settato il canale si caricano i feed e viene chiamata una
		 * funzione di callbak una volta caricati
		 */
		feed.load(function(result) {

			if (!result.error) {
				/*
				 * salvo i feed nella variabile Feeds.notizie la prima news �
				 * selezionata random, dalla seconda in poi vengono inserite
				 * nello stesso ordine con cui vengono ricevute
				 */
				var randIndex = Math.floor((Math.random() * result.feed.entries.length));
				var entryRand = result.feed.entries[randIndex];
				var itemRand = {
					title : entryRand.title,
					link : entryRand.link,
					description : entryRand.contentSnippet
				}
				Feeds.notizie.push(itemRand);

				for (var i = 0; i < result.feed.entries.length; i++) {
					if (i != randIndex) {
						var entry = result.feed.entries[i];
						var item = {
							title : entry.title,
							link : entry.link,
							description : entry.contentSnippet
						}
						Feeds.notizie.push(item);
					}
				}
			}
			/*
			 * Se ho caricato il primo canale allora chiamo la funzione per
			 * caricare il secondo
			 */
			if (channel == 0) {
				Feeds.Initfeed(1);
			} else {
				/*
				 * se ho caricato il secondo canale e carico i feed nell'html
				 */
				Feeds.caricafeed();

				$("#backNews").click(function() {
					Feeds.notizieid = Feeds.notizieid - 2;
					if (Feeds.notizieid < 0) {
						Feeds.notizieid = Feeds.notizie.length - 2;
					}
					Feeds.caricafeed();
				});

				$("#nextNews").click(function() {
					Feeds.notizieid = Feeds.notizieid + 2;
					if (Feeds.notizieid >= Feeds.notizie.length) {
						Feeds.notizieid = 0;
					}
					Feeds.caricafeed();
				});
			}

		});
	}
}

/* Funziona che visualizza gli RSS feed contenuti nella variabile notizie */
Feeds.caricafeed = function() {

	$(".dettaglioNews,.titoloNews").removeAttr("threedots");
	$(".threedots_ellipsis").remove();

	altezza_news = Math
			.floor(($("#InfoFeedDettaglio").height() - 1 - (Math.floor($("#InfoFeedDettaglio").width() * 0.01) * 2)) / 2);

	$("#PrimaNews").css("height", altezza_news);
	$("#SecondaNews").css("height", altezza_news);

	$("#PrimaNews .titoloNews .ellipsis_text").html(Feeds.notizie[Feeds.notizieid]["title"]);
	$("#PrimaNews a").attr("href", Feeds.notizie[Feeds.notizieid]["link"]);
	$("#PrimaNews .dettaglioNews .ellipsis_text ").html(Feeds.notizie[Feeds.notizieid]["description"]);

	$("#SecondaNews .titoloNews .ellipsis_text").html(Feeds.notizie[Feeds.notizieid + 1]["title"]);
	$("#SecondaNews a").attr("href", Feeds.notizie[Feeds.notizieid + 1]["link"]);
	$("#SecondaNews .dettaglioNews .ellipsis_text").html(Feeds.notizie[Feeds.notizieid + 1]["description"]);

	var diffContenitore_Notizie = $("#InfoFeedDettaglio").outerHeight(true) - 68
			- ((Math.floor($("InfoFeedDettaglio").width() * 0.01)) * 5);

	if (diffContenitore_Notizie < 0) {
		$("#SecondaNews").remove();
		$("#PrimaNews").css("position", "absolute").css("top", "25%").css("border", "0px");
	}

	$(".titoloNews").ThreeDots({
		max_rows : 1
	});
	$(".dettaglioNews").ThreeDots();

	$("#InfoFeedTitolo").show();
}

Feeds.InitfeedSim = function() {
	if (typeof NotizieSimul !== 'undefined') {
		Feeds.notizie = NotizieSimul;
	}

	Feeds.caricafeed();
	$("#backNews").click(function() {
		Feeds.notizieid = Feeds.notizieid - 2;
		if (Feeds.notizieid < 0)
			Feeds.notizieid = 8;

		Feeds.caricafeed();
	});

	$("#nextNews").click(function() {
		Feeds.notizieid = Feeds.notizieid + 2;
		if (Feeds.notizieid >= 10)
			Feeds.notizieid = 0;

		Feeds.caricafeed();
	});

};

/** Funzione lanciata al caricamento dello script google per gli RSS * */
Feeds.loadFeed = function() {
	google.load("feeds", "1", {
		"callback" : Feeds.launchFeed
	});
}

Feeds.launchFeed = function() {
	Feeds.Initfeed(0);
}
