# SH MetaalLab v1.1

Een Nederlandstalig, mobielvriendelijk technisch naslagwerk met 71 technische basisfiches in zes vakgebieden en 19 interactieve calculators. Ontworpen voor GitHub Pages, iPhone, tablet en laptop.

## Publiceren op GitHub Pages

1. Maak een **publieke** GitHub-repository `SH-MetaalLab`.
2. Upload de **inhoud** van deze map naar de hoofdmap van de repository. Zorg dat `index.html` direct in de root staat.
3. Open **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)**.
4. Wacht tot de Pages-publicatie klaar is en open `https://dhrhermans.github.io/SH-MetaalLab/` (als je GitHub-gebruikersnaam `DHRHermans` is).
5. Op iPhone: open de website in Safari → Deel → Zet op beginscherm.

De website is publiek bereikbaar. Publiceer geen persoonlijke of auteursrechtelijk beschermde PDF-bestanden in de repository.

## Inhoud en beperkingen

- De zes categorieën volgen de **onderwerpen** van een klassiek metaaltechnisch tabellenboek; de 71 korte fiches zijn zelfstandig geformuleerd en de 19 calculators zijn eigen implementaties van algemene formules.
- Het boek zelf, originele tabellen, illustraties en beschermde tekst zijn **niet** opgenomen.
- Fiches zijn een eerste inhoudelijke dekking en **niet** een volledige, geverifieerde vervanging van alle 416 pagina's. Voor professionele ontwerpbeslissingen moet je toepasselijke actuele normen en fabrikantgegevens raadplegen.
- PDF-import gebeurt uitsluitend lokaal en wordt niet geüpload. De PDF moet opnieuw worden gekozen na herladen. Favorieten worden per browser lokaal bewaard; er is geen synchronisatie tussen toestellen.
- Offline caching werkt nadat de app online is geladen. Bij iOS kan opslag worden gewist door het besturingssysteem.
- Gratis GitHub Pages vereist bij een standaard gratis account een publieke repository; de code is dus zichtbaar.

## Testen

Open via een lokale webserver, bijvoorbeeld `python -m http.server 8000`, en ga naar `http://localhost:8000`. Direct openen met `file://` werkt niet door het laden van JSON en de service worker.

## Projectstructuur

- `index.html` — interface
- `style.css` — responsieve vormgeving
- `app.js` — navigatie, zoekfunctie, favorieten en calculators
- `data.json` — originele technische fiches
- `manifest.webmanifest`, `service-worker.js` — installeerbare offline webapp
- `assets/icon.svg` — app-icoon

## Rechten

De code en eigen toelichtingen zijn gemaakt voor dit project. Bij toekomstige toevoegingen van externe teksten, illustraties of tabellen: controleer de rechten en vermeld de vereiste bron en licentie. Niet impliceren dat SH MetaalLab een officiële normpublicatie is.

## Nieuw in v1.1 — aanhaalmomenten

Een zelfstandige module **Aanhaalmomenten** voor metrische ISO-bouten M3–M36 met instelbare spoed, sterkteklasse 4.6 / 5.8 / 8.8 / 10.9 / 12.9, vereenvoudigde wrijvingsfactor en percentage proefbelasting. De uitkomst is **indicatief** en geen montagevoorschrift. Boutsterkte is niet hetzelfde als draagkracht van het basismateriaal. RVS en veiligheidskritische verbindingen vereisen afzonderlijke fabrikantspecificaties en verificatie.

## v1.2 – Schroefdraad en boutverbindingen
- Metrisch grof/fijn; UNC, UNF, UNEF; BSW, BSF; BSPP, BSPT, NPT als herkennings-/referentietabellen.
- Boutmateriaal, sterkteklasse, ondergrond en verbindingstype.
- Theoretisch aanhaalmoment uitsluitend voor geselecteerde 60°-draad met stalen bout en passende stalen moer en expliciet gekozen illustratieve K-factor. **Geen montagevoorschrift.**
- Voor RVS, non-ferro, getapte gaten, Whitworth en pijpdraad wordt geen Nm-waarde uitgegeven zonder aanvullende specificaties.
- De nominale inch-aanduiding bij BSP/NPT is geen werkelijke buitendiameter.
- Normverwijzingen: ISO 261, ISO 724, ISO 898-1, ISO 3506-1, ASME B1.1, BS 84, ISO 228-1, ISO 7-1, ASME B1.20.1 en VDI 2230.

Let op: de overzichten zijn een **selectie van veelgebruikte maten**, geen complete normtabellen. Controleer actuele normuitgaven en fabrikantspecificaties.


## v1.3 – Snijsnelheden voor boren, draaien en frezen

Nieuwe module met 15 materiaalcategorieën, HSS/HSS-Co/HSS-TiN, hardmetaal/Widia/VHM, wisselplaten en informatie over keramiek, CBN en PCD. Snijsnelheden zijn brede **illustratieve startbereiken** en geen gevalideerde aanbevelingen per gereedschap. Voor keramiek, CBN en PCD zijn geen automatische standaardwaarden; voer uitsluitend door de fabrikant opgegeven vc in. Berekent n = 1000 vc/(π D), bij frezen vf = fz × z × n en bij boren/draaien vf = f × n. Met optionele maximale spiltoerentalbegrenzing. Controleer machine, materiaalhardheid, gereedschapgeometrie, koelmiddel en opspanning.

Bronnen: Sandvik Coromant (formules), CIMCO CNC Book (oriëntatietabellen), LittleMachineShop en CGTK. Dit is geen volledige fabrikantendatabase en geen vervanging voor gereedschapscatalogi.
