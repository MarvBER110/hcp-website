/* ============================================================
   Holmes-Persönlichkeitstest — Textbausteine des Ergebnisberichts

   Einzige Quelle für alle personalisierten Texte. Wird sowohl von
   der Auswertungsseite (persoenlichkeitstest-ergebnis.html) als
   auch von der Druckvorlage (persoenlichkeitstest-bericht.html)
   geladen, damit beide nie auseinanderlaufen.

   Aufbau:
     DIM_LABEL      Anzeigename der vier Bereiche
     FACET_CONTENT  16 Facetten x hoch/niedrig
     DIM_CONTENT    4 Bereiche x hoch/niedrig
     ARCHETYPES     8 Archetypen
     PANEL_CONTENT  Handlungsempfehlungen, 4 Bereiche x hoch/niedrig
   ============================================================ */
(function(global){
  "use strict";

  var DIM_LABEL = { impact: "Impact", clarity: "Clarity", connection: "Connection", vision: "Vision" };

  var FACET_CONTENT = {
    drive: {
      high: { good: "hältst du an einem Ziel fest, auch wenn der Weg länger dauert als geplant, und motivierst dein Umfeld, dranzubleiben.", bad: "hältst du manchmal an einem Plan fest, obwohl neue Informationen längst für einen Kurswechsel sprechen.", goals: ["dein langer Atem bei mehrjährigen Vorhaben", "deine Fähigkeit, andere bei der Stange zu halten", "dein Blick fürs große Ganze"] },
      low: { good: "passt du deine Ziele flexibel an neue Gegebenheiten an und lässt liebgewonnene Pläne los, wenn sich die Lage ändert.", bad: "wechselst du manchmal das Ziel, bevor du das ursprüngliche wirklich ausgeschöpft hast.", goals: ["deine Offenheit für neue Wege", "deine schnelle Anpassung an veränderte Umstände", "dein Gespür dafür, wann sich Festhalten nicht mehr lohnt"] }
    },
    initiative: {
      high: { good: "übernimmst du den ersten Schritt, ohne auf eine Aufforderung zu warten, und bringst Themen aktiv voran.", bad: "übernimmst du manchmal mehr, als eigentlich in deinem Verantwortungsbereich liegt.", goals: ["dein Gespür für frühen Handlungsbedarf", "deine Bereitschaft, ohne Aufforderung loszulegen", "dein Mut, neue Aufgaben anzugehen"] },
      low: { good: "wartest du bewusst ab, bis klar ist, wer wofür zuständig ist, und greifst dann gezielt dort ein, wo du gebraucht wirst.", bad: "überlässt du die erste Bewegung manchmal zu lange anderen, auch wenn du selbst gut starten könntest.", goals: ["deine Zurückhaltung, bevor du unüberlegt loslegst", "dein Gespür für den richtigen Zeitpunkt zum Einsteigen", "deine Klarheit über Zuständigkeiten"] }
    },
    ownership: {
      high: { good: "stehst du zu Ergebnissen, auch wenn sie nicht wie geplant ausfallen, und bringst zugesagte Aufgaben zuverlässig zu Ende.", bad: "fällt es dir manchmal schwer, Aufgaben wirklich abzugeben, auch wenn andere sie übernehmen könnten.", goals: ["deine Verlässlichkeit bei zugesagten Aufgaben", "deine Bereitschaft, auch unbequeme Aufgaben zu übernehmen", "deine Entscheidungsfreude statt Verantwortung wegzuschieben"] },
      low: { good: "gibst du Aufgaben bewusst an die Person ab, die sie am besten erledigen kann, statt alles selbst zu übernehmen.", bad: "schiebst du Verantwortung manchmal ab, obwohl du selbst die richtige Ansprechperson wärst.", goals: ["deine Fähigkeit, Aufgaben sinnvoll zu verteilen", "dein Vertrauen in die Fähigkeiten anderer", "dein Gespür dafür, wann Delegieren die bessere Wahl ist"] }
    },
    resilience: {
      high: { good: "behältst du auch unter Zeitdruck einen klaren Kopf, und Kritik bringt dich selten aus dem Konzept.", bad: "zeigst du selten nach außen, wenn dich etwas wirklich belastet.", goals: ["deine Ruhe in angespannten Situationen", "deine schnelle Rückkehr in den eigenen Rhythmus nach Rückschlägen", "die Sicherheit, die du anderen gibst"] },
      low: { good: "spürst du Belastung früh und zeigst offen, wenn dir etwas zu viel wird — das macht es anderen leichter, dich zu unterstützen.", bad: "bringt dich Kritik oder Druck manchmal stärker aus dem Konzept, als es die Situation erfordern würde.", goals: ["deine Offenheit, wenn dich etwas belastet", "dein feines Gespür für Stimmungen und Stresssignale", "deine Ehrlichkeit über eigene Grenzen"] }
    },
    focus: {
      high: { good: "erkennst du Zusammenhänge, die anderen zunächst verborgen bleiben, und zerlegst komplexe Probleme in klare Schritte.", bad: "verlierst du dich manchmal in Details, bevor eine Entscheidung fällt.", goals: ["dein Blick für verborgene Zusammenhänge", "deine Fähigkeit, komplexe Probleme zu zerlegen", "dein kritisches Hinterfragen von Annahmen"] },
      low: { good: "triffst du Entscheidungen oft schnell und aus dem Bauch heraus, ohne dich in Details zu verlieren.", bad: "übersiehst du manchmal wichtige Zusammenhänge, weil dir die Zeit für eine gründliche Analyse fehlt.", goals: ["deine schnelle Auffassungsgabe", "dein Gespür für pragmatische Lösungen", "deine Fähigkeit, auch ohne vollständige Informationen zu handeln"] }
    },
    insight: {
      high: { good: "nimmst du dir bewusst Zeit, um aus Erfahrungen zu lernen, und hinterfragst auch eigene Entscheidungen ehrlich.", bad: "brauchst du manchmal länger, um ins Handeln zu kommen, weil du noch nachdenkst.", goals: ["deine Bereitschaft, aus Erfahrungen zu lernen", "dein ehrlicher Blick auf eigene Entscheidungen", "die Ruhe, die du in hektische Situationen bringst"] },
      low: { good: "reagierst du schnell und im Moment, ohne lange über vergangene Entscheidungen nachzudenken.", bad: "nimmst du dir selten die Zeit, aus abgeschlossenen Projekten bewusst etwas mitzunehmen.", goals: ["deine Schnelligkeit im Handeln", "deine Fähigkeit, im Moment zu entscheiden", "deinen unbeschwerten Umgang mit Abgeschlossenem"] }
    },
    structure: {
      high: { good: "bringst du Ordnung in unübersichtliche Situationen, ohne starr zu wirken, und schaffst Systeme, die andere leicht nachvollziehen können.", bad: "brauchst du länger, um dich zwischen mehreren guten Vorgehensweisen zu entscheiden.", goals: ["deine Fähigkeit, Ordnung zu schaffen", "dein Wechsel zwischen festem Plan und Anpassung", "dein Überblick bei parallelen Themen"] },
      low: { good: "passt du deine Vorgehensweise spontan an die jeweilige Situation an, statt starr an einem festen Ablauf festzuhalten.", bad: "fehlt dir bei sehr offenen Aufgaben manchmal ein Ankerpunkt, an dem du dich orientieren kannst.", goals: ["deine Anpassungsfähigkeit an neue Situationen", "deine Offenheit für unkonventionelle Vorgehensweisen", "deinen entspannten Umgang mit Unvorhergesehenem"] }
    },
    precision: {
      high: { good: "prüfst du wichtige Entscheidungen gründlich und erkennst Risiken, die bei schnellerem Vorgehen übersehen würden.", bad: "prüfst du bei einfachen Entscheidungen manchmal mehr, als nötig wäre.", goals: ["deine gründliche Prüfung wichtiger Entscheidungen", "dein Gespür für übersehene Risiken", "deine Standhaftigkeit gegen Zeitdruck"] },
      low: { good: "triffst du Entscheidungen zügig und hältst den Prozess dadurch in Bewegung.", bad: "übersiehst du bei wichtigen Entscheidungen manchmal Details, weil dir die gründliche Prüfung fehlt.", goals: ["deine schnelle Entscheidungsfähigkeit", "deinen Mut, auch bei Unsicherheit zu handeln", "dein Gespür dafür, wann langes Abwägen nicht nötig ist"] }
    },
    connect: {
      high: { good: "gehst du offen auf neue Kolleginnen und Kollegen zu und findest schnell einen Zugang zu unterschiedlichen Menschen.", bad: "ziehst du dich in sehr großen Gruppen manchmal eher zurück.", goals: ["dein offener Zugang zu unterschiedlichen Menschen", "dein belastbares berufliches Netzwerk", "deine Fähigkeit, Menschen zusammenzubringen"] },
      low: { good: "baust du zu wenigen Menschen dafür tiefere, verlässliche Beziehungen auf, statt dich breit zu vernetzen.", bad: "fällt es dir in großen, unbekannten Runden schwer, von dir aus den ersten Schritt zu machen.", goals: ["die Tiefe deiner bestehenden Kontakte", "deine bedachte Auswahl, mit wem du dich austauschst", "deine Ruhe in Gruppensituationen"] }
    },
    empathy: {
      high: { good: "erkennst du schnell, wie sich eine Situation für andere anfühlt, und andere fühlen sich bei dir verstanden.", bad: "nimmst du dir manchmal zu viel von den Sorgen anderer mit.", goals: ["dein Gespür für unausgesprochene Spannungen", "dein Verständnis für unterschiedliche Sichtweisen", "das Vertrauen, das andere dir entgegenbringen"] },
      low: { good: "triffst du Entscheidungen klar auf Basis von Fakten, ohne dich von Emotionen leiten zu lassen.", bad: "übersiehst du manchmal, wie eine Entscheidung bei anderen ankommt.", goals: ["deine sachliche, klare Entscheidungsfindung", "deine Fähigkeit, Emotionen aus schwierigen Themen herauszuhalten", "deine Konsequenz bei unangenehmen Entscheidungen"] }
    },
    teamwork: {
      high: { good: "bringst du unterschiedliche Standpunkte im Team zusammen und teilst Wissen bereitwillig mit anderen.", bad: "fällt es dir bei sehr eigenständigen Aufgaben manchmal schwer, andere einzubinden.", goals: ["deine Fähigkeit, gemeinsame Lösungen zu finden", "deine Bereitschaft, Wissen zu teilen", "deine Unterstützung auch außerhalb der eigenen Aufgabe"] },
      low: { good: "arbeitest du konzentriert und eigenverantwortlich an Lösungen, ohne auf ständige Abstimmung angewiesen zu sein.", bad: "bindest du andere manchmal zu spät ein, wenn ihre Perspektive weitergeholfen hätte.", goals: ["deine Eigenverantwortung bei Aufgaben", "deine Fähigkeit, fokussiert allein zu arbeiten", "deine Entscheidungsfreude ohne lange Abstimmungsrunden"] }
    },
    voice: {
      high: { good: "vertrittst du deine Meinung auch dann, wenn sie von der Mehrheit abweicht, und bringst deine Position klar auf den Punkt.", bad: "hältst du dich in sehr formellen Runden manchmal stärker zurück.", goals: ["deine klare, selbstsichere Kommunikation", "dein Mut, wichtige Punkte früh anzusprechen", "die Klarheit, die andere bei dir schätzen"] },
      low: { good: "hörst du in Diskussionen viel zu, bevor du dich äußerst, und triffst damit oft den richtigen Ton.", bad: "hältst du deine Meinung manchmal zurück, obwohl ein klares Wort weitergeholfen hätte.", goals: ["dein aufmerksames Zuhören", "deine bedachte, wohlüberlegte Wortwahl", "dein Gespür für den richtigen Moment, dich einzubringen"] }
    },
    curiosity: {
      high: { good: "gehst du offen auf ungewohnte Lösungswege zu und bringst Ideen ein, auf die im Team sonst niemand kommt.", bad: "springst du manchmal schon zur nächsten Idee, bevor die vorherige zu Ende gedacht ist.", goals: ["deine Offenheit für ungewohnte Lösungswege", "deine Fähigkeit, Neues mit Bewährtem zu kombinieren", "deine eigenen Denkanstöße für das Team"] },
      low: { good: "verlässt du dich auf Ansätze, die sich bereits bewährt haben, statt jedes Mal neu zu experimentieren.", bad: "lehnst du ungewohnte Vorschläge manchmal vorschnell ab, ohne sie wirklich zu prüfen.", goals: ["deine Verlässlichkeit auf bewährte Lösungen", "deine Konsequenz bei bekannten Methoden", "deine kritische Prüfung neuer Ideen"] }
    },
    growth: {
      high: { good: "eignest du dir neues Wissen auch außerhalb deines Kernbereichs an und nimmst Feedback als Anlass, dazuzulernen.", bad: "nimmst du dir für Neues manchmal Zeit, die für die laufende Aufgabe gerade knapp ist.", goals: ["deine Bereitschaft, aus Projekten zu lernen", "dein ernsthafter Umgang mit Feedback", "deine Weiterentwicklung über den eigenen Aufgabenbereich hinaus"] },
      low: { good: "setzt du auf das, was sich in der Praxis bereits bewährt hat, statt ständig Neues auszuprobieren.", bad: "investierst du selten Zeit in Weiterbildung außerhalb deines unmittelbaren Aufgabenbereichs.", goals: ["dein fundiertes Praxiswissen", "deine Verlässlichkeit bei bekannten Aufgaben", "deine Effizienz durch bewährte Routinen"] }
    },
    adaptability: {
      high: { good: "passt du dich schnell an neue Situationen an und siehst Veränderungen eher als Chance denn als Störung.", bad: "hältst du manchmal zu wenig an bewährten Abläufen fest, auch wenn sie noch funktionieren würden.", goals: ["deine schnelle Anpassung an neue Bedingungen", "deine Offenheit für Veränderung", "deinen Mut, Neues auszuprobieren"] },
      low: { good: "gibst du Veränderungsprozessen die nötige Stabilität und setzt Neuerungen gründlich und durchdacht um.", bad: "brauchst du bei plötzlichen Planänderungen oft etwas länger, um dich neu auszurichten.", goals: ["deine Stabilität in Phasen des Wandels", "deine gründliche Umsetzung von Veränderungen", "dein kritischer Blick auf neue Vorgehensweisen"] }
    },
    composure: {
      high: { good: "hältst du Unsicherheit gut aus und triffst auch bei unvollständigen Informationen brauchbare Entscheidungen.", bad: "wartest du manchmal zu wenig auf zusätzliche Klarheit, bevor du eine Entscheidung triffst.", goals: ["deine Gelassenheit in unklaren Situationen", "deinen kühlen Kopf trotz offener Fragen", "deine Entscheidungsfreude ohne vollständige Informationen"] },
      low: { good: "sorgst du dafür, dass offene Fragen wirklich geklärt werden, statt sie ungelöst mitzuschleppen.", bad: "kostet dich eine unklare Lage spürbar Tempo, weil dir der feste Boden fehlt, auf dem du sonst arbeitest.", goals: ["deinen Anspruch, offene Fragen wirklich zu klären", "dein Gespür dafür, wann Klarheit fehlt", "deine Verlässlichkeit, sobald die Lage eindeutig ist"] }
    }
  };

  var DIM_CONTENT = {
    impact: {
      high: { title: "Du bist zielstrebig und gehst ins Tun.", desc: "Wenn ein Ziel feststeht, bringst du Bewegung in die Sache. Du übernimmst gerne Verantwortung für Ergebnisse und lässt dich von Rückschlägen selten aus der Ruhe bringen. Auch unter Zeitdruck behältst du das eigentliche Ziel im Blick und triffst Entscheidungen, statt lange abzuwarten.", good: "hältst du beharrlich an Zielen fest, übernimmst von dir aus Verantwortung und behältst auch unter Druck einen klaren Kopf.", bad: "hältst du manchmal zu lange an einem Plan fest und zeigst selten, wenn dich etwas wirklich belastet.", goals: ["deine Beharrlichkeit bei längeren Vorhaben", "dein Gespür für den richtigen Moment, selbst zu starten", "deine Bereitschaft, Verantwortung zu übernehmen", "deine Ruhe unter Zeitdruck"] },
      low: { title: "Du bist überlegt und lässt dir Zeit für den nächsten Schritt.", desc: "Du gehst Vorhaben eher bedacht an und wägst ab, bevor du dich festlegst. Statt sofort loszulegen, prüfst du erst, ob der Weg wirklich der richtige ist. Das schützt dich davor, dich in Projekte zu verrennen, die sich später als falsch herausstellen.", good: "prüfst du sorgfältig, bevor du dich auf ein Ziel festlegst, und triffst dadurch selten überstürzte Entscheidungen.", bad: "fällt es dir manchmal schwer, ins Handeln zu kommen, weil du noch abwägst, statt loszulegen.", goals: ["deine sorgfältige Abwägung vor wichtigen Entscheidungen", "deine Offenheit, einen Plan noch einmal zu überdenken", "deine Bedachtsamkeit unter Zeitdruck", "dein Gespür dafür, wann ein Ziel wirklich lohnt"] }
    },
    clarity: {
      high: { title: "Du bist analytisch und behältst den Überblick.", desc: "Du gehst Themen gerne auf den Grund und ordnest neue Informationen zügig in ein größeres Bild ein. Bevor du entscheidest, betrachtest du Zusammenhänge in Ruhe und wägst mehrere Blickwinkel ab. Struktur gibt dir Sicherheit, gerade wenn ein Thema komplex wird.", good: "erkennst du Zusammenhänge schnell, ordnest komplexe Themen sauber und triffst gut durchdachte Entscheidungen.", bad: "verlierst du dich manchmal in Details und lässt dir mit einer Entscheidung länger Zeit, als andere erwarten.", goals: ["dein Blick für verborgene Zusammenhänge", "deine Bereitschaft, aus Erfahrungen zu lernen", "deine Fähigkeit, Ordnung in unübersichtliche Themen zu bringen", "deine gründliche Prüfung wichtiger Entscheidungen"] },
      low: { title: "Du entscheidest aus dem Bauch heraus und bleibst dabei handlungsfähig.", desc: "Du verlässt dich gern auf dein Gespür und triffst Entscheidungen zügig, statt jedes Detail vorher zu analysieren. Das macht dich handlungsfähig, auch wenn nicht alle Informationen vorliegen.", good: "triffst du auch unter Zeitdruck schnell tragfähige Entscheidungen, ohne dich in Analysen zu verlieren.", bad: "übersiehst du bei komplexen Themen manchmal wichtige Details, weil dir die gründliche Prüfung fehlt.", goals: ["deine schnelle Entscheidungsfähigkeit", "dein gutes Bauchgefühl", "deine Handlungsfähigkeit auch bei unvollständigen Informationen", "deine pragmatische Herangehensweise"] }
    },
    connection: {
      high: { title: "Du findest im Austausch mit anderen die Balance.", desc: "Du gehst offen auf andere zu und bringst unterschiedliche Sichtweisen zusammen. Im Team achtest du sowohl auf das Ergebnis als auch darauf, wie sich der Weg dorthin für alle Beteiligten anfühlt. Du nimmst Spannungen früh wahr und trägst aktiv dazu bei, sie aufzulösen.", good: "gehst du offen auf andere zu, erkennst schnell, wie sich eine Situation für sie anfühlt, und bringst Standpunkte zusammen.", bad: "ziehst du dich in großen Gruppen eher zurück und nimmst dir manchmal zu viel von den Sorgen anderer mit.", goals: ["dein offener Zugang zu unterschiedlichen Menschen", "dein Gespür für unausgesprochene Spannungen", "deine Fähigkeit, gemeinsame Lösungen zu finden", "deine klare, selbstsichere Kommunikation"] },
      low: { title: "Du arbeitest fokussiert und eigenständig an deinen Themen.", desc: "Du bevorzugst konzentriertes Arbeiten für dich und stimmst dich eher punktuell mit anderen ab, statt ständig im Austausch zu sein. Das gibt dir Raum, Themen tief zu durchdringen.", good: "arbeitest du konzentriert und eigenverantwortlich, ohne auf ständige Abstimmung angewiesen zu sein.", bad: "bindest du andere manchmal später ein, als es dem Team lieb wäre.", goals: ["deine fokussierte, eigenständige Arbeitsweise", "deine Tiefe bei einzelnen Themen", "deine Klarheit in der eigenen Position", "deine Effizienz ohne viele Abstimmungsrunden"] }
    },
    vision: {
      high: { title: "Du bist neugierig und gehst Veränderungen aktiv an.", desc: "Du bist offen für Neues und siehst Veränderung eher als Chance denn als Risiko. Neue Ideen und ungewohnte Wege reizen dich, auch wenn sie noch nicht erprobt sind.", good: "gehst du neue Ideen mit Neugier an und bringst selbst häufig frische Impulse ins Team ein.", bad: "verlierst du manchmal die Geduld mit bewährten, aber langsameren Abläufen.", goals: ["deine Offenheit für neue Ideen", "deinen Mut, ungewohnte Wege auszuprobieren", "deine schnelle Anpassung an Veränderungen", "deine Fähigkeit, andere für Neues zu begeistern"] },
      low: { title: "Du prüfst Neues sorgfältig, bevor du handelst.", desc: "Veränderung ist für dich kein Selbstzweck. Du prüfst neue Ideen lieber genau, bevor du dich darauf einlässt, und hältst an bewährten Wegen fest, solange sie funktionieren. Das gibt dir Stabilität, gerade wenn sich viel gleichzeitig verändert.", good: "prüfst du neue Ideen ernsthaft, bevor du dich darauf einlässt, und gibst Veränderungsprozessen die Stabilität, die sie brauchen.", bad: "brauchst du bei plötzlichen Planänderungen etwas länger, um dich neu auszurichten.", goals: ["deine sorgfältige Prüfung neuer Ansätze", "deine Bereitschaft, aus Projekten zu lernen", "deine Stabilität in Phasen des Wandels", "deinen Blick dafür, was sich bereits bewährt hat"] }
    }
  };

  var ARCHETYPES = {
    "clarity-impact": { name: "Der Umsetzer", desc: "Du gehst Herausforderungen strukturiert an, übernimmst Verantwortung und verlierst das Ziel auch unter Druck nicht aus den Augen. Deine Klarheit sorgt für gut durchdachte Entscheidungen, deine Wirkkraft dafür, dass daraus sichtbare Ergebnisse werden." },
    "connection-impact": { name: "Der Mitreißer", desc: "Du bringst Dinge ins Rollen und nimmst dabei die Menschen um dich herum mit. Du überzeugst nicht nur durch Tempo, sondern auch durch echten Austausch — dein Team merkt, dass Ergebnisse und Miteinander für dich zusammengehören." },
    "impact-vision": { name: "Der Pionier", desc: "Du probierst neue Wege aus und bringst sie konsequent zu Ende. Wo andere noch abwägen, hast du längst den ersten Schritt gemacht — und bleibst dabei so lange dran, bis wirklich etwas daraus wird." },
    "clarity-connection": { name: "Der Vermittler", desc: "Du bringst Klarheit in komplexe Situationen und behältst dabei immer im Blick, wie es den Menschen um dich herum damit geht. Deine Stärke ist es, schwierige Themen so aufzubereiten, dass alle Beteiligten mitgenommen werden." },
    "clarity-vision": { name: "Der Vordenker", desc: "Du durchdringst neue Themen schnell und erkennst früh, wohin sich etwas entwickeln könnte. Struktur und Neugier sind für dich kein Widerspruch — du ordnest Ideen, statt sie zu verwerfen." },
    "connection-vision": { name: "Der Impulsgeber", desc: "Du bringst neue Ideen ins Team und sorgst gleichzeitig dafür, dass sie auf offene Ohren treffen. Veränderung gelingt bei dir, weil du Menschen dafür begeistern kannst, nicht nur überzeugen musst." },
    "balanced-high": { name: "Der Allrounder", desc: "Du bist in allen vier Bereichen solide aufgestellt, ohne dass einer davon eindeutig überwiegt. Das macht dich vielseitig einsetzbar — du kannst dich je nach Situation flexibel auf das konzentrieren, was gerade gebraucht wird." },
    "balanced-low": { name: "Der Entdecker", desc: "Dein Profil zeigt noch keinen klaren Schwerpunkt — das ist kein Nachteil, sondern ein Zeichen dafür, dass du in vielen Situationen unterschiedliche Seiten von dir zeigen kannst. Mit der Zeit kristallisiert sich oft von selbst heraus, wo deine Stärken am meisten zur Geltung kommen." }
  };

  var PANEL_CONTENT = {
    impact: {
      high: {
        keep: "Bleib die Person, die ein Ziel zu Ende bringt — dein langer Atem ist gerade bei anspruchsvollen Vorhaben ein echter Vorteil für dein Team.",
        change: "Prüfe unterwegs bewusst, ob das Ziel noch stimmt. Plane feste Punkte ein, an denen du dein Vorgehen noch einmal hinterfragst, statt es automatisch weiterzuverfolgen.",
        start: "Hol dir bei wichtigen Vorhaben eine Zwischenmeinung ein. Eine kurze Rückmeldung von außen kann früh zeigen, ob dein Kurs noch der richtige ist.",
        tips: [
          { t: "Teile große Ziele in Etappen.", p: "Kurze, sichtbare Zwischenschritte machen deinen langen Atem für andere nachvollziehbar und motivieren zusätzlich." },
          { t: "Sag aktiv, wenn du an einem Ziel festhältst.", p: "So wissen andere, dass eine Pause im Fortschritt kein Aufgeben bedeutet, sondern zum Prozess gehört." },
          { t: "Frag gezielt nach, wenn ein Vorhaben ins Stocken gerät.", p: "Dein Blick für das große Ganze hilft dir, Hindernisse einzuordnen, bevor sie zum Problem werden." },
          { t: "Feiere erreichte Meilensteine bewusst.", p: "Das macht deine Ausdauer für dich selbst sichtbar und gibt dir Energie für die nächste Etappe." }
        ]
      },
      low: {
        keep: "Bleib bei deiner Gewohnheit, ein Ziel erst zu prüfen, bevor du dich festlegst — das erspart deinem Team Umwege, die andere erst spät bemerken.",
        change: "Setz dir für das Abwägen selbst eine Frist. Wenn bis dahin nichts Entscheidendes dazugekommen ist, ist das ein gutes Zeichen, jetzt loszugehen.",
        start: "Fang bei neuen Vorhaben mit dem kleinsten sinnvollen Schritt an. Ein erster Schritt bringt dir oft mehr Klarheit als eine weitere Runde Nachdenken.",
        tips: [
          { t: "Halte fest, was dich zum Start bringt.", p: "Wenn du weißt, welche Bedingung dir den Anfang leicht macht, kannst du sie beim nächsten Vorhaben bewusst herstellen." },
          { t: "Sag früh, wenn dir etwas zu viel wird.", p: "Andere können dich nur unterstützen, wenn sie merken, wo gerade der Druck liegt — dieses offene Signal ist eine echte Stärke." },
          { t: "Übernimm bewusst eine Aufgabe, die sonst liegen bleibt.", p: "Eine überschaubare Aufgabe in eigener Verantwortung zeigt dir, wie sich Vorangehen anfühlt, ohne dass viel auf dem Spiel steht." },
          { t: "Halte Zwischenstände schriftlich fest.", p: "So siehst du selbst, wie viel schon vorangegangen ist, auch wenn sich das Tempo für dich nicht so anfühlt." }
        ]
      }
    },
    clarity: {
      high: {
        keep: "Bring dort Struktur rein, wo sie fehlt. Deine Fähigkeit, zwischen festem Plan und Flexibilität zu wechseln, hilft besonders in Situationen, die sich laufend verändern.",
        change: "Entscheide dich bei Gleichwertigem schneller. Wenn mehrere Vorgehensweisen ähnlich gut sind, hilft eine einfache Faustregel, damit die Wahl nicht unnötig lange dauert.",
        start: "Leg dir für wiederkehrende Aufgaben feste Abläufe an. Ein einfacher Standardablauf schafft dir Freiraum für die Themen, die wirklich Abwägung brauchen.",
        tips: [
          { t: "Visualisiere komplexe Themen früh.", p: "Eine einfache Skizze oder Liste macht deine Ordnung für andere sofort nachvollziehbar." },
          { t: "Biete deine Struktur aktiv an.", p: "In unübersichtlichen Situationen hilft es dem Team oft, wenn du deinen Plan frühzeitig teilst, statt ihn nur für dich zu behalten." },
          { t: "Lass bewusst Raum für Abweichungen.", p: "Nicht jeder Prozess muss von Anfang an perfekt geordnet sein — manchmal darf sich Struktur erst unterwegs ergeben." },
          { t: "Räume regelmäßig auf.", p: "Kurze, feste Zeitpunkte zum Aufräumen von Aufgaben und Unterlagen erhalten deine Übersicht auch langfristig." }
        ]
      },
      low: {
        keep: "Vertrau weiter auf dein Tempo bei Entscheidungen — in Situationen, in denen andere noch abwägen, hältst du den Prozess in Bewegung.",
        change: "Nimm dir bei den wenigen wirklich großen Entscheidungen bewusst mehr Zeit als sonst. Nicht jede Entscheidung braucht das, diese aber schon.",
        start: "Notier dir vor dem Start die zwei, drei Punkte, die am Ende stimmen müssen. Eine kurze Liste reicht, um das Wichtigste nicht zu übersehen.",
        tips: [
          { t: "Lass eine zweite Person kurz drüberschauen.", p: "Ein Blick von außen findet oft in zwei Minuten das Detail, das dir in der Geschwindigkeit entgangen ist." },
          { t: "Frag bei unklaren Aufträgen nach dem gewünschten Ergebnis.", p: "Eine einzige Rückfrage am Anfang erspart dir später eine ganze Schleife." },
          { t: "Sammle wiederkehrende Aufgaben in einer einfachen Liste.", p: "Schon eine grobe Ordnung genügt, damit nichts hinten runterfällt — perfekt muss sie nicht sein." },
          { t: "Nimm dir nach größeren Vorhaben kurz Zeit für einen Rückblick.", p: "Zehn Minuten reichen, um mitzunehmen, was beim nächsten Mal anders laufen sollte." }
        ]
      }
    },
    connection: {
      high: {
        keep: "Bleib die Person, die Standpunkte zusammenbringt — diese ausgleichende Rolle im Team wird oft erst sichtbar, wenn sie einmal fehlt.",
        change: "Binde andere früher in deine Überlegungen ein. Ein kurzer Zwischenstand ans Team verhindert, dass Abstimmung erst ganz am Ende passiert.",
        start: "Verteile Aufgaben in Gruppen sichtbarer. Eine klare, gemeinsam sichtbare Aufteilung erleichtert es allen, den Überblick zu behalten.",
        tips: [
          { t: "Moderiere bewusst zwischen unterschiedlichen Meinungen.", p: "Deine ausgleichende Art eignet sich besonders für Situationen, in denen Fronten drohen zu verhärten." },
          { t: "Mach Beiträge einzelner sichtbar.", p: "Ein kurzes Wort der Anerkennung stärkt den Zusammenhalt, den du im Team aufbaust." },
          { t: "Hol still gebliebene Stimmen aktiv dazu.", p: "So wird die Zusammenarbeit, die du förderst, auch für die leiseren im Team spürbar." },
          { t: "Kläre Rollen frühzeitig.", p: "Das verhindert, dass deine ausgleichende Art zulasten der eigenen Position geht." }
        ]
      },
      low: {
        keep: "Bleib bei deiner Fähigkeit, dich in ein Thema zu vertiefen — diese ungeteilte Konzentration ist etwas, das in vielen Teams fehlt.",
        change: "Teile Zwischenstände früher, auch wenn noch nicht alles fertig ist. Für andere ist ein unfertiger Stand meist wertvoller als gar keiner.",
        start: "Such dir pro Woche ein Gespräch außerhalb deines direkten Umfelds. Ein einziger Kontakt reicht, um den Blick auf das eigene Thema zu weiten.",
        tips: [
          { t: "Sag zu Beginn, wie du arbeiten möchtest.", p: "Wenn andere wissen, dass du Phasen für dich brauchst, wird deine Zurückhaltung nicht als Desinteresse gelesen." },
          { t: "Bring deine Position einmal pro Besprechung aktiv ein.", p: "Deine Sicht ist durchdacht — sie hilft anderen aber nur, wenn sie sie auch hören." },
          { t: "Frag bei Meinungsverschiedenheiten nach dem Warum.", p: "Eine ehrliche Rückfrage bringt dich schneller weiter als der Versuch, die eigene Sicht zu verteidigen." },
          { t: "Halte wenige Kontakte bewusst warm.", p: "Ein kurzer Anruf ab und zu erhält genau die verlässlichen Beziehungen, die deine Stärke sind." }
        ]
      }
    },
    vision: {
      high: {
        keep: "Bring weiterhin die Ideen ein, auf die im Team sonst niemand kommt — daraus entstehen die Ansätze, die später selbstverständlich wirken.",
        change: "Bring eine Idee zu Ende, bevor du die nächste anfängst. Der eigentliche Wert entsteht meist erst im letzten Drittel der Umsetzung.",
        start: "Frag bei bewährten Abläufen zuerst, warum es sie gibt. Manchmal steckt darin ein Grund, den ein neuer Weg mitdenken muss.",
        tips: [
          { t: "Teste neue Ansätze erst im Kleinen.", p: "Ein kurzer Versuch überzeugt Zweifelnde mehr als jedes Argument — und kostet wenig, wenn er nicht aufgeht." },
          { t: "Erkläre den Nutzen, nicht nur die Idee.", p: "Wer versteht, was sich konkret verbessert, geht den ungewohnten Weg deutlich eher mit." },
          { t: "Gib Bewährtem eine faire Chance.", p: "Nicht jeder eingespielte Ablauf ist überholt — manche funktionieren, gerade weil sie unspektakulär sind." },
          { t: "Halte fest, was du ausprobiert hast.", p: "Eine kurze Notiz zu jedem Versuch macht aus einzelnen Experimenten mit der Zeit echtes Erfahrungswissen." }
        ]
      },
      low: {
        keep: "Gib Veränderungsprozessen weiterhin die nötige Stabilität — deine Gründlichkeit sorgt dafür, dass Neuerungen sauber umgesetzt werden.",
        change: "Räume dir bei Planänderungen bewusst eine kurze Übergangszeit ein, statt dich sofort dagegen zu stemmen.",
        start: "Frag dich bei Veränderungen zuerst nach der Chance, nicht dem Risiko. Das kann deine natürliche Vorsicht sinnvoll ergänzen.",
        tips: [
          { t: "Setz dir eine kurze Bedenkzeit statt einer langen.", p: "Ein bewusstes Zeitlimit hilft dir, schneller in Richtung Entscheidung zu kommen, ohne die Sorgfalt zu verlieren." },
          { t: "Frag dich, was im schlimmsten Fall passiert.", p: "Oft zeigt sich, dass eine schnellere Anpassung weniger riskant ist, als sie sich anfühlt." },
          { t: "Hol dir bei größeren Änderungen eine zweite Einschätzung.", p: "Eine kurze Außenperspektive kann dir helfen, schneller Klarheit zu gewinnen." },
          { t: "Übe an kleinen Entscheidungen.", p: "Wer öfter kleine Anpassungen zügig trifft, gewinnt Sicherheit auch für die größeren." }
        ]
      }
    }
  };


  /* Bereiche und Facetten: Reihenfolge, Beschriftungen, Skalenpole, Farben. */
  var DIM_META = {
    impact: { de: "Wirkkraft", color: "#C4462B", facets: ["drive", "initiative", "ownership", "resilience"] },
    clarity: { de: "Klarheit", color: "#2E6FA3", facets: ["focus", "insight", "structure", "precision"] },
    connection: { de: "Resonanz", color: "#2E7D4C", facets: ["connect", "empathy", "teamwork", "voice"] },
    vision: { de: "Weitblick", color: "#7B5FA6", facets: ["curiosity", "growth", "adaptability", "composure"] }
  };

  var FACET_META = {
    drive: { en: "Drive", de: "Zielbeharrlichkeit", low: "Anpassungsbereit", high: "Beharrlich", dim: "impact" },
    initiative: { en: "Initiative", de: "Eigeninitiative", low: "Abwartend", high: "Selbststartend", dim: "impact" },
    ownership: { en: "Ownership", de: "Verantwortungsübernahme", low: "Delegiert gern", high: "Übernimmt gern", dim: "impact" },
    resilience: { en: "Resilience", de: "emotionale Belastungsstabilität", low: "Reagiert sensibel", high: "Bleibt gelassen", dim: "impact" },
    focus: { en: "Focus", de: "analytisches Denken", low: "Intuitiv", high: "Analytisch", dim: "clarity" },
    insight: { en: "Insight", de: "Reflexionsbereitschaft", low: "Spontan", high: "Reflektiert", dim: "clarity" },
    structure: { en: "Structure", de: "Strukturorientierung", low: "Flexibel", high: "Strukturiert", dim: "clarity" },
    precision: { en: "Precision", de: "sorgfältige Urteilsbildung", low: "Schnell entscheidend", high: "Sorgfältig prüfend", dim: "clarity" },
    connect: { en: "Connect", de: "Kontaktorientierung", low: "Zurückhaltend", high: "Kontaktfreudig", dim: "connection" },
    empathy: { en: "Empathy", de: "Perspektivübernahme", low: "Sachlich", high: "Einfühlsam", dim: "connection" },
    teamwork: { en: "Teamwork", de: "Kooperationsorientierung", low: "Eigenständig", high: "Kooperativ", dim: "connection" },
    voice: { en: "Voice", de: "selbstsichere Kommunikation", low: "Zurückhaltend", high: "Selbstsicher", dim: "connection" },
    curiosity: { en: "Curiosity", de: "Ideenoffenheit", low: "Bewährtorientiert", high: "Ideenoffen", dim: "vision" },
    growth: { en: "Growth", de: "Lernbereitschaft", low: "Erfahrungsbasiert", high: "Lernorientiert", dim: "vision" },
    adaptability: { en: "Adaptability", de: "Veränderungsbereitschaft", low: "Stabilitätssuchend", high: "Wandelbereit", dim: "vision" },
    composure: { en: "Composure", de: "konstruktiver Umgang mit Unsicherheit", low: "Sucht Klarheit", high: "Hält Unsicherheit aus", dim: "vision" }
  };
  global.HCP_INHALTE = {
    DIM_LABEL: DIM_LABEL,
    FACET_CONTENT: FACET_CONTENT,
    DIM_CONTENT: DIM_CONTENT,
    ARCHETYPES: ARCHETYPES,
    PANEL_CONTENT: PANEL_CONTENT,
    DIM_META: DIM_META,
    FACET_META: FACET_META
  };
})(this);
