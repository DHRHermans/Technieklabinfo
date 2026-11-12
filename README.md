# SH MetaalLab

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
