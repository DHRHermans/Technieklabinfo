'use strict';
let DB={categories:[],entries:[]},view='home',cat=null,query='',pdfURL=null;
const $=id=>document.getElementById(id), fmt=(n,d=3)=>Number.isFinite(n)?n.toLocaleString('nl-BE',{maximumFractionDigits:d}):'—';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const favorites=()=>{try{return JSON.parse(localStorage.getItem('sh-favs')||'[]')}catch{return []}};
const saveFav=id=>{let a=favorites();a=a.includes(id)?a.filter(x=>x!==id):[...a,id];localStorage.setItem('sh-favs',JSON.stringify(a));render()};
const category=id=>DB.categories.find(c=>c.id===id);
const catCard=c=>`<article class="card" data-category="${c.id}" tabindex="0"><div class="symbol">${c.symbol}</div><h3>${esc(c.name)}</h3><p>${DB.entries.filter(e=>e.category===c.id).length} onderwerpen · bekijken →</p></article>`;
const topicRow=e=>`<article class="topic" data-entry="${e.id}" tabindex="0"><div><strong>${esc(e.title)}</strong><p>${esc(e.summary.slice(0,110))}${e.summary.length>110?'…':''}</p></div><span class="tag">${esc(e.tag)}</span></article>`;
const header=(ey,title,sub='')=>`<div class="eyebrow">${ey}</div><h1>${esc(title)}</h1>${sub?`<p class="intro">${esc(sub)}</p>`:''}`;
const tools=[
{id:'rpm',name:'Toerental',category:'Verspaning',formula:'n = 1000 × vc / (π × D)',fields:[['vc','Snijsnelheid (m/min)',25],['d','Diameter (mm)',12]],calc:a=>[1000*a.vc/(Math.PI*a.d),'omw/min']},
{id:'feed',name:'Voedingssnelheid',category:'Verspaning',formula:'vf = f × n',fields:[['f','Voeding (mm/omw)',.2],['n','Toerental (omw/min)',1000]],calc:a=>[a.f*a.n,'mm/min']},
{id:'time',name:'Bewerkingstijd',category:'Verspaning',formula:'t = L / vf',fields:[['L','Bewerkingslengte (mm)',100],['vf','Voeding (mm/min)',200]],calc:a=>[a.L/a.vf,'min']},
{id:'mass',name:'Massa ronde staaf',category:'Materialen',formula:'m = π × (D/2000)² × (L/1000) × ρ',fields:[['D','Diameter (mm)',20],['L','Lengte (mm)',1000],['rho','Dichtheid (kg/m³)',7850]],calc:a=>[Math.PI*(a.D/2000)**2*(a.L/1000)*a.rho,'kg']},
{id:'block',name:'Massa rechthoekig blok',category:'Materialen',formula:'m = (L × B × H / 10⁹) × ρ',fields:[['L','Lengte (mm)',100],['B','Breedte (mm)',50],['H','Hoogte (mm)',20],['rho','Dichtheid (kg/m³)',7850]],calc:a=>[a.L*a.B*a.H/1e9*a.rho,'kg']},
{id:'force',name:'Hydraulische cilinderkracht',category:'Hydrauliek',formula:'F = p × A; A = πD²/4',fields:[['p','Druk (bar)',100],['D','Zuigerdiameter (mm)',50]],calc:a=>[a.p*1e5*Math.PI*(a.D/1000)**2/4,'N (ideaal)']},
{id:'retract',name:'Cilinderkracht ingaand',category:'Hydrauliek',formula:'F = p × π(D² − d²)/4',fields:[['p','Druk (bar)',100],['D','Zuigerdiameter (mm)',50],['rod','Stangdiameter (mm)',20]],calc:a=>a.rod>=a.D?[NaN,'Stang moet kleiner zijn dan zuiger']: [a.p*1e5*Math.PI*((a.D/1000)**2-(a.rod/1000)**2)/4,'N (ideaal)']},
{id:'ohm',name:'Wet van Ohm',category:'Elektriciteit',formula:'U = I × R',fields:[['I','Stroom (A)',2],['R','Weerstand (Ω)',12]],calc:a=>[a.I*a.R,'V']},
{id:'power',name:'Elektrisch vermogen',category:'Elektriciteit',formula:'P = U × I',fields:[['U','Spanning (V)',24],['I','Stroom (A)',2]],calc:a=>[a.U*a.I,'W']},
{id:'series',name:'Weerstanden in serie',category:'Elektriciteit',formula:'Rtot = R₁ + R₂ + R₃',fields:[['r1','R₁ (Ω)',100],['r2','R₂ (Ω)',220],['r3','R₃ (Ω)',330]],calc:a=>[a.r1+a.r2+a.r3,'Ω']},
{id:'parallel',name:'Weerstanden parallel',category:'Elektriciteit',formula:'Rtot = 1 / (1/R₁ + 1/R₂)',fields:[['r1','R₁ (Ω)',100],['r2','R₂ (Ω)',220]],calc:a=>[1/(1/a.r1+1/a.r2),'Ω']},
{id:'stress',name:'Trekspanning',category:'Sterkteleer',formula:'σ = F / A',fields:[['F','Kracht (N)',10000],['A','Oppervlakte (mm²)',100]],calc:a=>[a.F/a.A,'N/mm² (MPa)']},
{id:'moment',name:'Krachtmoment',category:'Mechanica',formula:'M = F × l (loodrechte kracht)',fields:[['F','Kracht (N)',200],['l','Arm (m)',.5]],calc:a=>[a.F*a.l,'Nm']},
{id:'ratio',name:'Tandwieloverbrenging',category:'Machine-elementen',formula:'i = z₂ / z₁; n₂ = n₁ / i',fields:[['z1','Tanden aandrijver',20],['z2','Tanden aangedreven',40],['n1','Ingaand toerental',1200]],calc:a=>[a.n1*a.z1/a.z2,'omw/min (uitgaand)']},
{id:'thread',name:'Kerngat vuistregel',category:'Schroefdraad',formula:'Dboor ≈ Dnominaal − spoed',fields:[['D','Nominale diameter (mm)',10],['P','Spoed (mm)',1.5]],calc:a=>a.P>=a.D?[NaN,'Ongeldige verhouding']:[a.D-a.P,'mm (benadering)']},
{id:'pressure',name:'Druk berekenen',category:'Fluïdumtechniek',formula:'p = F / A; 1 bar = 100 000 Pa',fields:[['F','Kracht (N)',1000],['A','Oppervlakte (cm²)',10]],calc:a=>[a.F/(a.A/10000)/1e5,'bar']},
{id:'volume',name:'Cilindervolume',category:'Meetkunde',formula:'V = π(D/2)² × L',fields:[['D','Diameter (mm)',50],['L','Lengte (mm)',100]],calc:a=>[Math.PI*(a.D/2)**2*a.L/1e6,'liter']},
{id:'eff',name:'Rendement',category:'Mechanica',formula:'η = Puit / Pin × 100%',fields:[['out','Afgegeven vermogen (W)',800],['in','Opgenomen vermogen (W)',1000]],calc:a=>[a.out/a.in*100,'%']},
{id:'flow',name:'Debiet uit cilindersnelheid',category:'Hydrauliek',formula:'Q = A × v',fields:[['D','Zuigerdiameter (mm)',50],['v','Snelheid (mm/s)',100]],calc:a=>[Math.PI*(a.D/1000)**2/4*(a.v/1000)*60000,'L/min']}
];

// Indicatieve berekening voor metrische ISO-grove schroefdraad.
// GEEN voorgeschreven aanhaalmoment: controleer de fabrikant- en verbindingsspecificatie.
const boltPitch={3:.5,4:.7,5:.8,6:1,8:1.25,10:1.5,12:1.75,14:2,16:2,18:2.5,20:2.5,22:2.5,24:3,27:3,30:3.5,33:3.5,36:4};
const boltGrades={
 '4.6':{proof:225,description:'Koolstofstaal 4.6'},
 '5.8':{proof:380,description:'Koolstofstaal 5.8'},
 '8.8':{proof:580,description:'Koolstofstaal 8.8'},
 '10.9':{proof:830,description:'Gelegeerd staal 10.9'},
 '12.9':{proof:970,description:'Gelegeerd staal 12.9'}
};
const boltConditions={
 dry:{k:.20,label:'Droog / onbekend (voorbeeld K = 0,20)'},
 oiled:{k:.15,label:'Licht geolied (voorbeeld K = 0,15)'},
 high:{k:.25,label:'Hogere wrijving (voorbeeld K = 0,25)'}
};
function boltTorque(d,p,grade,k,ratio){
 const area=Math.PI/4*(d-.9382*p)**2;
 const preload=area*grade.proof*ratio;
 return {area,preload,torque:k*preload*d/1000};
}
const threadFamilies={
 metric:{label:'Metrisch ISO grof (M)',sizes:[[3,.5],[4,.7],[5,.8],[6,1],[8,1.25],[10,1.5],[12,1.75],[14,2],[16,2],[18,2.5],[20,2.5],[22,2.5],[24,3],[27,3],[30,3.5],[36,4]],angle:60},
 fine:{label:'Metrisch ISO fijn (MF)',sizes:[[8,1],[10,1],[10,1.25],[12,1.25],[12,1.5],[14,1.5],[16,1.5],[18,1.5],[20,1.5],[24,2],[30,2]],angle:60},
 unc:{label:'Unified UNC',sizes:[[.25,20],[.3125,18],[.375,16],[.4375,14],[.5,13],[.5625,12],[.625,11],[.75,10],[.875,9],[1,8]],angle:60,inch:true},
 unf:{label:'Unified UNF',sizes:[[.25,28],[.3125,24],[.375,24],[.4375,20],[.5,20],[.5625,18],[.625,18],[.75,16],[.875,14],[1,12]],angle:60,inch:true},
 unef:{label:'Unified UNEF',sizes:[[.25,32],[.3125,32],[.375,32],[.4375,28],[.5,28],[.5625,24],[.625,24],[.75,20],[.875,20],[1,20]],angle:60,inch:true},
 bsw:{label:'Whitworth BSW (referentie)',sizes:[[.25,20],[.3125,18],[.375,16],[.5,12],[.625,11],[.75,10],[1,8]],angle:55,inch:true,reference:true},
 bsf:{label:'Whitworth BSF (referentie)',sizes:[[.25,26],[.3125,22],[.375,20],[.5,16],[.625,14],[.75,12],[1,10]],angle:55,inch:true,reference:true},
 bspp:{label:'BSPP / G (pijpdraad)',sizes:[[.125,28],[.25,19],[.375,19],[.5,14],[.75,14],[1,11]],angle:55,inch:true,pipe:true},
 bspt:{label:'BSPT / R (pijpdraad)',sizes:[[.125,28],[.25,19],[.375,19],[.5,14],[.75,14],[1,11]],angle:55,inch:true,pipe:true},
 npt:{label:'NPT (pijpdraad)',sizes:[[.125,27],[.25,18],[.375,18],[.5,14],[.75,14],[1,11.5]],angle:60,inch:true,pipe:true}
};
const boltMaterials={steel:'Koolstof- of gelegeerd staal',stainless:'RVS (ISO 3506)',brass:'Messing / brons',aluminium:'Aluminiumlegering',titanium:'Titaniumlegering',other:'Ander / onbekend'};
const baseMaterials={nut:'Bijpassende stalen moer',steel:'Staal met binnendraad',stainless:'RVS met binnendraad',cast:'Gietijzer',aluminium:'Aluminium',brass:'Messing / brons',magnesium:'Magnesiumlegering',plastic:'Kunststof / composiet',other:'Andere ondergrond'};
function boltView(){
 const opts=(obj)=>Object.entries(obj).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('');
 $('content').innerHTML=`<div class="detail"><div class="breadcrumbs">Machine-elementen / Schroefdraad en boutverbindingen</div>
 ${header('TECHNISCH NASLAGWERK','Schroefdraad & aanhaalmomenten','Metrische en inch-schroefdraad, materiaalklassen en een transparant rekenmodel.')}
 <div class="note"><strong>Veiligheidsgrens:</strong> een aanhaalmoment is verbindingsspecifiek. De berekening hieronder is uitsluitend een theoretische vergelijking, nooit een montagevoorschrift. Gebruik voor wielen, remmen, hijsmiddelen, druksystemen en andere veiligheidskritische toepassingen uitsluitend goedgekeurde fabrikantgegevens.</div>
 <section class="panel"><h2>1 · Draad identificeren</h2><div class="formgrid">
 <div class="field"><label for="threadFamily">Draadfamilie</label><select id="threadFamily">${Object.entries(threadFamilies).map(([id,f])=>`<option value="${id}">${esc(f.label)}</option>`).join('')}</select></div>
 <div class="field"><label for="threadSize">Nominale maat / gangen</label><select id="threadSize"></select></div>
 <div class="field"><label for="threadPitch">Spoed in mm (informatief)</label><input id="threadPitch" type="text" readonly></div>
 <div class="field"><label for="threadAngle">Profielhoek</label><input id="threadAngle" type="text" readonly></div>
 </div><p id="threadNote" class="small"></p><div class="table-scroll"><table class="bolt-table"><thead><tr><th>Draadaanduiding</th><th>Nominale Ø</th><th>Spoed / TPI</th></tr></thead><tbody id="threadTable"></tbody></table></div>
 <p class="small">Bij BSP en NPT is de nominale inch-aanduiding géén buitendiameter. De tabel geeft daarom bewust geen berekende nominale buitendiameter. Voor een echte maatcontrole zijn de normtabellen en toleranties nodig.</p></section>
 <section class="panel"><h2>2 · Bout en verbinding</h2><div class="formgrid">
 <div class="field"><label for="boltMaterial">Boutmateriaal</label><select id="boltMaterial">${opts(boltMaterials)}</select></div>
 <div class="field"><label for="boltGrade">Sterkteklasse (staal)</label><select id="boltGrade">${Object.keys(boltGrades).map(g=>`<option value="${g}" ${g==='8.8'?'selected':''}>${g}</option>`).join('')}</select></div>
 <div class="field"><label for="boltBase">Moer / ondergrond</label><select id="boltBase">${opts(baseMaterials)}</select></div>
 <div class="field"><label for="boltJoint">Verbinding</label><select id="boltJoint"><option value="nut">Doorsteekbout met moer</option><option value="tapped">Bout in getapt gat</option><option value="other">Andere verbinding</option></select></div>
 <div class="field"><label for="boltEngagement">Effectieve inschroeflengte (mm)</label><input id="boltEngagement" type="number" min="0" step="0.1" placeholder="Vereist voor controle"></div>
 <div class="field"><label for="boltCondition">Wrijvingsaanname</label><select id="boltCondition"><option value="unknown">Onbekend (geen berekening)</option><option value="dry">Voorbeeld K = 0,20</option><option value="oiled">Voorbeeld K = 0,15</option><option value="high">Voorbeeld K = 0,25</option></select></div>
 <div class="field"><label for="boltLoad">Percentage proefbelasting (voorbeeld)</label><input id="boltLoad" type="number" min="1" max="90" value="70"></div>
 </div><div class="result" id="boltResult" aria-live="polite"></div>
 <p class="small">Vereenvoudigde vergelijking voor metrische of Unified 60°-draad met stalen bout: Aₛ ≈ π/4 · (d − 0,9382P)²; Fᵥ = Aₛ · Sₚ · aandeel; T ≈ K · Fᵥ · d. Voor Unified is dit slechts een geometrische benadering. K is een illustratieve factor, niet een gemeten wrijvingscoëfficiënt. De uitkomst is niet gevalideerd voor een specifieke verbinding.</p>
 <div class="actions"><button class="btn secondary" id="boltCopy">Kopieer vergelijking</button></div></section>
 <section class="panel"><h2>3 · Materiaalklassen</h2><div class="table-scroll"><table class="bolt-table"><thead><tr><th>Stalen boutklasse</th><th>Voorbeeld-proefspanning</th><th>Toepassingsbeperking</th></tr></thead><tbody>${Object.entries(boltGrades).map(([g,v])=>`<tr><td>${g}</td><td>${v.proof} MPa</td><td>ISO 898-1; controleer diameterbereik en productspecificatie</td></tr>`).join('')}</tbody></table></div>
 <p>RVS: A2-50, A2-70, A2-80, A4-50, A4-70 en A4-80 zijn materiaalaanduidingen volgens ISO 3506, <strong>geen</strong> equivalenten van staal 8.8 of 10.9. Messing, aluminium, titanium en kunststof vereisen een specifieke legering, toestand en bevestigerspecificatie. Daarom worden hiervoor geen automatische Nm-waarden gegenereerd.</p>
 <p>Bij schroefdraad in aluminium, gietijzer of andere ondergronden moet de draaduitreksterkte afzonderlijk worden beoordeeld. De opgegeven inschroeflengte is informatief en vervangt die controle niet.</p></section>
 <section class="panel"><h2>4 · Bronnen en toepassingsgebied</h2><p>ISO 261 / ISO 724 (metrische draad), ASME B1.1 (Unified), BS 84 (Whitworth), ISO 228-1 (BSPP), ISO 7-1 (BSPT), ASME B1.20.1 (NPT), ISO 898-1 (stalen bevestigers), ISO 3506-1 (RVS), VDI 2230 (ontwerp boutverbindingen).</p>
 <p class="small">Dit is een zelfstandig opgebouwd referentieoverzicht. Raadpleeg de actuele normen, leveranciersdocumentatie en verbindingstekening voor exacte toleranties, sterktebereiken en aanhaalmomenten. Pijpdraad gebruikt een andere montage- en afdichtingsmethodiek.</p></section></div>`;
 function setFamily(){const f=threadFamilies[$('threadFamily').value];$('threadSize').innerHTML=f.sizes.map(([d,p],i)=>`<option value="${i}">${f.inch?(f.pipe?`${d}″ — ${p} TPI`:`${d}″ — ${p} TPI`):`M${d} × ${p}`}</option>`).join('');$('threadSize').selectedIndex=Math.min(2,f.sizes.length-1);$('threadTable').innerHTML=f.sizes.map(([d,p])=>`<tr><td>${f.inch?`${d}″`: `M${d}`} ${f.inch?`${p} TPI`:`× ${p}`}</td><td>${f.pipe?'Nominale pijpmaat':`${fmt(f.inch?d*25.4:d,3)} mm`}</td><td>${f.inch?`${p} TPI / ${fmt(25.4/p,3)} mm`:`${p} mm`}</td></tr>`).join('');setSize()}
 function setSize(){const f=threadFamilies[$('threadFamily').value], [d,p]=f.sizes[Number($('threadSize').value)];$('threadPitch').value=fmt(f.inch?25.4/p:p,3);$('threadAngle').value=f.angle+'°';$('threadNote').textContent=f.pipe?'Pijpdraad: nominale maat is geen buitendiameter. Aanhaalmoment niet beschikbaar.':f.reference?'Whitworth: 55° profiel. Geometrie uitsluitend als naslag; geen automatische momentberekening.':'Nominale maat en spoed: controleer bij montage ook de tolerantieklasse en de werkelijke draad.';calc()}
 function calc(){const f=threadFamilies[$('threadFamily').value], [d0,p0]=f.sizes[Number($('threadSize').value)],d=f.inch?d0*25.4:d0,p=f.inch?25.4/p0:p0;
 const mat=$('boltMaterial').value,base=$('boltBase').value,joint=$('boltJoint').value,cond=$('boltCondition').value,load=Number($('boltLoad').value),eng=$('boltEngagement').value;
 let reason='';if(f.pipe)reason='Pijpdraad vereist fitting- en afdichtingsspecifieke montagevoorschriften.';else if(f.reference)reason='Voor Whitworth is het 60°-rekenmodel niet geschikt.';else if(mat!=='steel')reason='Voor dit boutmateriaal zijn eerst gevalideerde productgegevens nodig.';else if(joint!=='nut'||base!=='nut')reason='Een getapt gat of afwijkende ondergrond vereist eerst een controle van binnendraad, contactdruk en inschroeflengte.';else if(cond==='unknown')reason='De wrijvingsconditie is onbekend. Kies alleen een K-factor om een theoretisch voorbeeld te zien.';else if(!Number.isFinite(load)||load<=0||load>90)reason='Voer een percentage tussen 1 en 90 in.';
 if(reason){$('boltResult').innerHTML=`<small>Geen aanhaalmoment beschikbaar</small><p>${esc(reason)}</p>`;return}
 const k=boltConditions[cond].k,r=boltTorque(d,p,boltGrades[$('boltGrade').value],k,load/100);
 $('boltResult').innerHTML=`<small>THEORETISCH REKENVOORBEELD — GEEN MONTAGEVOORSCHRIFT</small><strong>${fmt(r.torque,1)} Nm</strong><small>Geschatte voorspanning: ${fmt(r.preload/1000,2)} kN · Spanningsdoorsnede: ${fmt(r.area,2)} mm² · K = ${fmt(k,2)}</small><small>Werkelijke waarden kunnen sterk afwijken door wrijving, toleranties en verbindingstype.</small>`;
 }
 $('threadFamily').addEventListener('change',setFamily);$('threadSize').addEventListener('change',setSize);
 ['boltMaterial','boltGrade','boltBase','boltJoint','boltEngagement','boltCondition','boltLoad'].forEach(id=>$(id).addEventListener('input',calc));
 $('boltCopy').onclick=()=>navigator.clipboard?.writeText('SH MetaalLab — theoretische vergelijking, geen montagevoorschrift\n'+$('boltResult').innerText).catch(()=>{});
 setFamily();
}


// Snijgegevens: onafhankelijke, indicatieve startbereiken; fabrikantgegevens hebben voorrang.
let cuttingDB=null;
const cutOps={drill:'Boren',turn:'Draaien',mill:'Frezen'};
const cutToolOpts={
 drill:[['hss','HSS spiraalboor'],['hssco','HSS-Co (kobalt)'],['tin','HSS met TiN-coating'],['carbide','Volhardmetaal (VHM / Widia)'],['indexable','Wisselplaatboor (hardmetaal)']],
 turn:[['hss','HSS draaibeitel'],['hssco','HSS-Co draaibeitel'],['carbide','Hardmetaal draaibeitel / wisselplaat'],['ceramic','Keramische snijplaat'],['cbn','CBN'],['pcd','PCD']],
 mill:[['hss','HSS vingerfrees'],['hssco','HSS-Co vingerfrees'],['tin','HSS met coating'],['carbide','VHM / Widia vingerfrees'],['indexable','Wisselplaatfrees'],['pcd','PCD-frees']]
};
const cutBands=(entry,op,tool)=>{
 if(!entry)return null;
 const band=entry.ranges[op];
 if(['hss','hssco','tin'].includes(tool))return {lo:band[0],hi:band[1],status:tool==='hss'?'Algemeen indicatief HSS-startbereik':'Voorlopig HSS-referentiebereik; gereedschapspecifieke Co/coatinggegevens ontbreken'};
 if(['carbide','indexable'].includes(tool))return {lo:band[2],hi:band[3],status:tool==='carbide'?'Algemeen indicatief hardmetaal-startbereik':'Voorlopig hardmetaal-referentiebereik; wisselplaatgegevens ontbreken'};
 return null;
};
function cuttingView(){
 if(!cuttingDB){$('content').innerHTML=header('VERSPANING','Snijsnelheden','De gegevens worden geladen…');return}
 const materialOptions=cuttingDB.materials.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('');
 $('content').innerHTML=`<div class="detail">${header('VERSPANING · PRAKTISCHE REKENHULP','Boren, draaien & frezen','Kies materiaal, bewerking en snijgereedschap. Bereken toerental en voeding op basis van transparante startbereiken.')}
 <div class="note"><strong>Richtwaarden, geen machine-instructies.</strong> De materiaalwaarden zijn indicatieve startbereiken en niet voor elke combinatie experimenteel gevalideerd. Hardheid, coating, geometrie, koelmiddel, uitsteeklengte, machinevermogen en opspanning kunnen de juiste waarden sterk wijzigen. Controleer altijd de fabrikantgegevens.</div>
 <section class="panel"><h2>Snijgegevens instellen</h2><div class="formgrid">
 <div class="field"><label for="cutOp">Bewerking</label><select id="cutOp"><option value="drill">Boren</option><option value="turn">Draaien</option><option value="mill">Frezen</option></select></div>
 <div class="field"><label for="cutMaterial">Werkstukmateriaal</label><select id="cutMaterial">${materialOptions}</select></div>
 <div class="field"><label for="cutTool">Gereedschap</label><select id="cutTool"></select></div>
 <div class="field"><label for="cutDiameter">Snijdiameter D (mm)</label><input type="number" id="cutDiameter" value="10" min="0.01" step="any" inputmode="decimal"></div>
 <div class="field"><label for="cutVc">Snijsnelheid vc (m/min)</label><input type="number" id="cutVc" min="0.01" step="any" inputmode="decimal"></div>
 <div class="field"><label for="cutFeed">Voeding per omwenteling / tand (mm)</label><input type="number" id="cutFeed" value="0.10" min="0.001" step="any" inputmode="decimal"></div>
 <div class="field" id="cutTeethWrap"><label for="cutTeeth">Effectieve snijkanten z (frezen)</label><input type="number" id="cutTeeth" value="4" min="1" max="100" step="1"></div>
 <div class="field"><label for="cutMax">Maximaal spiltoerental (omw/min, optioneel)</label><input type="number" id="cutMax" min="1" step="1" placeholder="Niet ingesteld"></div>
 </div>
 <p class="small" id="cutBand"></p><div class="result" id="cutResult" aria-live="polite"></div>
 <p class="small">Boren/draaien: f in mm/omw, vf = f × n. Frezen: fz in mm/tand, vf = fz × z × n. n = 1000 × vc / (π × D). Bij draaien is D de actuele werkstukdiameter; bij frezen de effectieve snijdiameter.</p>
 <div class="actions"><button class="btn secondary" id="cutCopy">Kopieer resultaat</button><button class="btn secondary" id="cutReset">Herstel aanbevolen startwaarde</button></div></section>
 <section class="panel"><h2>Richtwaardentabel per materiaal</h2><p class="small">Snijsnelheid in m/min. Dit zijn brede illustratieve startbereiken, geen complete cataloguswaarden. Kies de juiste bewerking en gereedschap hierboven.</p><div class="table-scroll"><table class="bolt-table"><thead><tr><th>Werkstuk</th><th>HSS</th><th>Hardmetaal</th></tr></thead><tbody id="cutTable"></tbody></table></div></section>
 <section class="panel"><h2>Gereedschapskeuze en grenzen</h2><p><strong>HSS:</strong> algemene snelstaalsoorten; <strong>HSS-Co:</strong> kobaltgelegeerd HSS; <strong>TiN:</strong> een coating, geen afzonderlijk basismateriaal; <strong>Widia/VHM:</strong> hardmetaal; <strong>wisselplaten:</strong> verschillende hardmetaalkwaliteiten en coatings; <strong>keramiek, CBN en PCD:</strong> alleen bij geschikte materialen en bewerkingen. Voor de laatste drie zijn geen automatische standaardwaarden beschikbaar.</p><p>Ook diameter, hardheid (HB/HRC), aantal snijkanten, spaandiepte, radiale ingreep, koelstrategie en machinebeperkingen moeten voor definitieve parameters bekend zijn. Bij boren beïnvloeden boordiepte en spaanafvoer de voeding sterk.</p></section>
 <section class="panel"><h2>Bronnen en herkomst</h2><p class="small">De formules zijn gebaseerd op gangbare verspaningsleer en documentatie van Sandvik Coromant. De voorbeeldbereiken zijn eigen, afgeronde oriëntatiewaarden op basis van algemene tabellen; ze zijn niet rechtstreeks overgenomen uit één fabrikantcatalogus en niet per gereedschap gevalideerd.</p>${cuttingDB.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a></p>`).join('')}</section></div>`;
 let lastAuto=null;
 const populate=()=>{const op=$('cutOp').value;$('cutTool').innerHTML=cutToolOpts[op].map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('');$('cutTeethWrap').style.display=op==='mill'?'':'none';autoVc();};
 const autoVc=()=>{const m=cuttingDB.materials.find(x=>x.id===$('cutMaterial').value),band=cutBands(m,$('cutOp').value,$('cutTool').value);lastAuto=band;if(band)$('cutVc').value=((band.lo+band.hi)/2).toFixed(1);else $('cutVc').value='';calc()};
 const calc=()=>{const op=$('cutOp').value,m=cuttingDB.materials.find(x=>x.id===$('cutMaterial').value),tool=$('cutTool').value,band=cutBands(m,op,tool),D=Number($('cutDiameter').value),vc=Number($('cutVc').value),f=Number($('cutFeed').value),z=Number($('cutTeeth').value),max=$('cutMax').value.trim()===''?null:Number($('cutMax').value);$('cutTable').innerHTML=cuttingDB.materials.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.ranges[op][0]}–${x.ranges[op][1]}</td><td>${x.ranges[op][2]}–${x.ranges[op][3]}</td></tr>`).join('');$('cutBand').textContent=band?`Indicatief ${esc(band.status)}: ${band.lo}–${band.hi} m/min. Eigen invoer blijft mogelijk.`:'Geen gevalideerd standaardbereik voor deze gereedschapsoort: vul uitsluitend een door de fabrikant opgegeven vc in.';
 if(!($('cutDiameter').value.trim()&&$('cutVc').value.trim()&&$('cutFeed').value.trim())||![D,vc,f].every(x=>Number.isFinite(x)&&x>0)||(op==='mill'&&(!Number.isInteger(z)||z<1||z>100))||(max!==null&&(!Number.isFinite(max)||max<=0))){$('cutResult').innerHTML='<small>Vul geldige positieve waarden in. Zonder snijsnelheid van de fabrikant kan deze combinatie niet automatisch worden berekend.</small>';return}
 const raw=1000*vc/(Math.PI*D),n=max===null?raw:Math.min(raw,max),vf=n*f*(op==='mill'?z:1),actual=Math.PI*D*n/1000;
 const advisory=!band?'Eigen fabrikantwaarde noodzakelijk':(vc<band.lo||vc>band.hi?'Buiten het indicatieve startbereik':'Binnen het indicatieve startbereik');
 $('cutResult').innerHTML=`<small>${esc(advisory)} · ${esc(cutOps[op])}</small><strong>${fmt(n,0)} omw/min</strong><small>Voeding: ${fmt(vf,1)} mm/min · Werkelijke vc: ${fmt(actual,1)} m/min${max!==null&&raw>max?' · begrensd door machine':''}</small><small>Controleer machine, gereedschap, koelmiddel, hardheid en opspanning.</small>`;
 };
 $('cutOp').addEventListener('change',populate);$('cutMaterial').addEventListener('change',autoVc);$('cutTool').addEventListener('change',autoVc);['cutDiameter','cutVc','cutFeed','cutTeeth','cutMax'].forEach(id=>$(id).addEventListener('input',calc));$('cutReset').onclick=autoVc;$('cutCopy').onclick=()=>navigator.clipboard?.writeText('SH MetaalLab — indicatieve snijgegevens, geen machine-instructie\n'+$('cutResult').innerText).catch(()=>{});populate();
}

function navigate(v,extra){view=v;cat=extra||null;query='';render();window.scrollTo(0,0);history.replaceState(null,'','#'+(extra||v))}
function render(){document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));const el=$('content');if(view==='home'){el.innerHTML=`<section class="hero"><div class="eyebrow">KENNIS · TECHNIEK · PRAKTIJK</div><h1>Alle techniek binnen handbereik.</h1><p>Een onafhankelijk Nederlandstalig naslagwerk, geïnspireerd door de bruikbaarheid van een klassiek technisch tabellenboek. Snel zoeken, helder raadplegen en direct rekenen.</p><div class="actions"><button class="btn" data-go="search">Zoek een onderwerp →</button><button class="btn secondary" data-go="calculators">Open calculators</button></div></section><div class="sectiontop"><h2>Vakgebieden</h2><span class="count">${DB.entries.length} technische fiches</span></div><div class="grid">${DB.categories.map(catCard).join('')}</div><div class="sectiontop"><h2>Direct aan de slag</h2><span class="count">${tools.length} calculators</span></div><div class="toolcards">${tools.slice(0,4).map(toolCard).join('')}<article class="card" data-go="cutting" tabindex="0"><span class="tag">Verspaning</span><h3 style="margin-top:16px">Boren · draaien · frezen →</h3><p>Snijsnelheden voor HSS en hardmetaal</p></article><article class="card" data-go="bolts" tabindex="0"><span class="tag">Boutverbindingen</span><h3 style="margin-top:16px">Aanhaalmomenten →</h3><p>Sterkteklasse, draadmaat en wrijving</p></article></div>`}
else if(view==='category'){const c=category(cat);el.innerHTML=header('VAKGEBIED',c.name,`${DB.entries.filter(e=>e.category===cat).length} technische onderwerpen`)+`<div class="searchbox"><input id="filter" type="search" placeholder="Zoeken binnen ${esc(c.name)}…" aria-label="Zoeken binnen categorie"></div><div id="results">${DB.entries.filter(e=>e.category===cat).map(topicRow).join('')}</div>`;bindFilter(cat)}
else if(view==='search'){el.innerHTML=header('KENNISBANK','Zoeken','Zoek door alle technische fiches en onderwerpen.')+`<div class="searchbox"><input id="filter" type="search" placeholder="Bijv. M10, kracht, lager, GRAFCET…" aria-label="Zoekterm" autofocus></div><div class="sectiontop"><span id="resultCount" class="count">${DB.entries.length} resultaten</span></div><div id="results">${DB.entries.map(topicRow).join('')}</div>`;bindFilter()}
else if(view==='detail'){const e=DB.entries.find(e=>e.id===cat);if(!e)return navigate('home');let related=tools.filter(t=>(e.title+' '+e.tag).toLowerCase().includes(t.category.toLowerCase())||t.name.toLowerCase().includes(e.title.toLowerCase())||e.title.toLowerCase().includes(t.name.toLowerCase()));el.innerHTML=`<div class="detail"><div class="breadcrumbs">${esc(category(e.category).name)} / ${esc(e.tag)}</div><div class="detailhead"><div>${header('TECHNISCHE FICHE',e.title)}</div><button class="star" data-fav="${e.id}" title="Favoriet">${favorites().includes(e.id)?'★':'☆'}</button></div><section class="panel"><h2>Technische kerninformatie</h2><p>${esc(e.summary)}</p><p class="small muted">Onderwerp: ${esc(e.tag)} · Zelfstandig geformuleerde basisinformatie.</p></section><div class="note" style="margin-top:20px">Dit is een beknopte technische fiche, geen vervanging van actuele normen, machinehandleidingen of veiligheidsprocedures. Normtabellen en ontwerpgrenswaarden moeten voor de concrete toepassing worden geverifieerd.</div><div class="sectiontop"><h2>Bijbehorende hulpmiddelen</h2></div><div class="toolcards">${(related.length?related:tools.filter(t=>['rpm','mass','force'].includes(t.id))).slice(0,3).map(toolCard).join('')}</div></div>`}
else if(view==='bolts'){boltView()}
else if(view==='cutting'){cuttingView()}
else if(view==='calculators'){el.innerHTML=header('INTERACTIEVE WERKBANK','Calculators',`${tools.length} technische rekenhulpmiddelen met zichtbare formules en invoercontrole.`)+`<div class="toolcards"><article class="card" data-go="cutting" tabindex="0"><span class="tag">Verspaning</span><h3 style="margin-top:16px">Boren · draaien · frezen →</h3><p>Snijsnelheden voor HSS en hardmetaal</p></article><article class="card" data-go="bolts" tabindex="0"><span class="tag">Boutverbindingen</span><h3 style="margin-top:16px">Aanhaalmomenten →</h3><p>Sterkteklasse, draadmaat en wrijving</p></article>${tools.map(toolCard).join('')}</div>`}
else if(view==='tool'){const t=tools.find(t=>t.id===cat);if(!t)return navigate('calculators');el.innerHTML=`<div class="detail"><div class="breadcrumbs">Calculators / ${esc(t.category)}</div>${header('INTERACTIEVE CALCULATOR',t.name)}<section class="panel"><h3>Formule</h3><div class="formula">${esc(t.formula)}</div><div class="formgrid" style="margin-top:20px">${t.fields.map(([id,label,value])=>`<div class="field"><label for="f_${id}">${esc(label)}</label><input type="number" inputmode="decimal" step="any" id="f_${id}" value="${value}"></div>`).join('')}</div><div class="result" id="calcout" aria-live="polite"></div><div class="actions"><button class="btn secondary" id="copyResult">Kopieer resultaat</button><button class="btn secondary" data-go="calculators">Alle calculators</button></div></section><div class="note" style="margin-top:16px">Rekenkundig resultaat op basis van een vereenvoudigd model. Houd rekening met verliezen, veiligheidsfactoren, werkelijke bedrijfsomstandigheden en actuele technische voorschriften.</div></div>`;function calculate(){let a={};for(const [id] of t.fields){let raw=$('f_'+id).value.trim();let n=Number(raw);if(!raw||!Number.isFinite(n)||n<=0){$('calcout').innerHTML='<small>Vul voor alle velden geldige waarden groter dan nul in.</small>';return}a[id]=n}let [n,unit]=t.calc(a);$('calcout').innerHTML=Number.isFinite(n)&&n>0?`<small>Resultaat</small><strong>${fmt(n,4)} ${esc(unit)}</strong>`:`<small>Controleer de ingevoerde waarden. ${esc(unit)}</small>`}t.fields.forEach(([id])=>$('f_'+id).addEventListener('input',calculate));calculate();$('copyResult').onclick=()=>navigator.clipboard?.writeText(`${t.name}\n${t.formula}\n${$('calcout').innerText}`).catch(()=>{})}
else if(view==='favorites'){let arr=DB.entries.filter(e=>favorites().includes(e.id));el.innerHTML=header('PERSOONLIJK','Favorieten','Favorieten worden lokaal in deze browser bewaard, niet op GitHub.')+(arr.length?arr.map(topicRow).join(''):'<div class="empty">Nog geen favorieten. Open een technische fiche en tik op ☆.</div>')}
else if(view==='pdf'){el.innerHTML=header('LOKAAL DOCUMENT','Mijn PDF','Open een eigen, rechtmatig verkregen PDF. Het bestand wordt niet geüpload naar GitHub of een server.')+`<section class="panel"><label for="pdfFile">Selecteer een PDF op dit toestel</label><input type="file" id="pdfFile" accept="application/pdf" style="margin-top:12px"><p class="small">Je selecteert het bestand opnieuw wanneer je de app heropent. Op iPhone kan de ingebouwde PDF-weergave verschillen per iOS-versie.</p><p id="pdfMessage" class="muted"></p><a id="pdfLink" target="_blank" rel="noopener" style="display:none">Open PDF in nieuw venster</a><iframe id="pdfFrame" class="pdfviewer" title="Mijn PDF" style="display:none;margin-top:16px"></iframe></section>`;$('pdfFile').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.type!=='application/pdf'&&!f.name.toLowerCase().endsWith('.pdf')){$('pdfMessage').textContent='Kies een PDF-bestand.';return}if(pdfURL)URL.revokeObjectURL(pdfURL);pdfURL=URL.createObjectURL(f);$('pdfFrame').src=pdfURL;$('pdfFrame').style.display='block';$('pdfLink').href=pdfURL;$('pdfLink').style.display='inline-block';$('pdfMessage').textContent=`Lokaal geopend: ${f.name}`}}
}
function toolCard(t){return `<article class="card" data-tool="${t.id}" tabindex="0"><span class="tag">${esc(t.category)}</span><h3 style="margin-top:16px">${esc(t.name)} →</h3><p>${esc(t.formula)}</p></article>`}
function bindFilter(categoryId){const input=$('filter');input.addEventListener('input',()=>{let q=input.value.trim().toLocaleLowerCase('nl');let a=DB.entries.filter(e=>(!categoryId||e.category===categoryId)&&[e.title,e.summary,e.tag,category(e.category).name].join(' ').toLocaleLowerCase('nl').includes(q));$('results').innerHTML=a.length?a.map(topicRow).join(''):'<div class="empty">Geen resultaten gevonden.</div>';if($('resultCount'))$('resultCount').textContent=a.length+' resultaten'})}
document.addEventListener('click',e=>{const f=e.target.closest('[data-fav]');if(f)return saveFav(f.dataset.fav);const g=e.target.closest('[data-go]');if(g)return navigate(g.dataset.go);const b=e.target.closest('[data-view]');if(b)return navigate(b.dataset.view);const c=e.target.closest('[data-category]');if(c)return navigate('category',c.dataset.category);const r=e.target.closest('[data-entry]');if(r)return navigate('detail',r.dataset.entry);const t=e.target.closest('[data-tool]');if(t)return navigate('tool',t.dataset.tool)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-entry],[data-category],[data-tool]'))e.target.click()});
$('theme').onclick=()=>{document.body.classList.toggle('light');localStorage.setItem('sh-theme',document.body.classList.contains('light')?'light':'dark')};if(localStorage.getItem('sh-theme')==='light')document.body.classList.add('light');
fetch('./cutting-data.json').then(r=>r.json()).then(d=>{cuttingDB=d;if(view==='cutting')render()}).catch(()=>{});
fetch('./data.json').then(r=>{if(!r.ok)throw Error('Geen gegevens');return r.json()}).then(d=>{DB=d;$('sidecats').innerHTML=DB.categories.map(c=>`<button class="nav" data-category="${c.id}">${c.symbol} <span>${esc(c.name)}</span></button>`).join('');render()}).catch(()=>{$('content').innerHTML='<div class="empty">Gegevens konden niet worden geladen. Open de website via GitHub Pages of een lokale webserver (niet rechtstreeks als file://).</div>'});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
