::: center
**DEPARTAMENTUL DE INGINERIE ELECTRICĂ, ELECTRONICĂ ȘI CALCULATOARE\
PROGRAMUL DE STUDII CALCULATOARE**

**Sistem integrat de monitorizare și gestiune a consumului energetic
prin rețele LoRaWAN**  \
 \
LUCRARE DE LICENȚĂ

 \

  -------------- --------------------------------
  Absolvent:     **Alin Alexandru Sima**

                 

  Coordonator\   **Sl. dr. Ing. Bogdan Văduva**
  științific:    
  -------------- --------------------------------

**2026**
:::

::: center
**DEPARTAMENTUL DE INGINERIE ELECTRICĂ, ELECTRONICĂ ȘI CALCULATOARE\
PROGRAMUL DE STUDII CALCULATOARE**
:::

  -------- -------------------------------
  DECAN,   DIRECTOR DEPARTAMENT,
           **Sl. dr. ing. Claudiu LUNG**
  -------- -------------------------------

::: center
Absolvent: **Alin Alexandru Sima**

**Sistem integrat de monitorizare și gestiune a consumului energetic
prin rețele LoRaWAN**
:::

1.  **Enunțul temei:** *Scurtă descriere a temei lucrării de licență și
    datele inițiale*

2.  **Conținutul lucrării:** *(enumerarea părților componente) Exemplu:
    Pagina de prezentare, aprecierile coordonatorului de lucrare, titlul
    capitolului 1, titlul capitolului 2, titlul capitolului n,
    bibliografie, anexe.*

3.  **Locul documentării:** *Exemplu*: Centrul Universitar NORD din Baia
    Mare

4.  **Consultanți:**

5.  **Data emiterii temei:** 1 Noiembrie 2023

6.  **Data predării:** 10 iulie 2024

Absolvent:

------------------------------------------------------------------------

Coordonator științific:

------------------------------------------------------------------------

::: center
**DEPARTAMENTUL DE INGINERIE ELECTRICĂ, ELECTRONICĂ ȘI CALCULATOARE\
PROGRAMUL DE STUDII CALCULATOARE**
:::

::: center
**Declarație pe propria răspundere privind\
autenticitatea lucrării de licență**
:::

::: minipage
Subsemnatul(a)

------------------------------------------------------------------------

,

------------------------------------------------------------------------

legitimat(ă) cu\

------------------------------------------------------------------------

seria

------------------------------------------------------------------------

nr.

------------------------------------------------------------------------

CNP

------------------------------------------------------------------------

, autorul lucrării 

------------------------------------------------------------------------

------------------------------------------------------------------------

elaborată în vederea susținerii examenului de finalizare a studiilor de
licență la Facultatea de Automatică și Calculatoare, Specializarea

------------------------------------------------------------------------

din cadrul Universității Tehnice din Cluj-Napoca, sesiunea

------------------------------------------------------------------------

a anului universitar

------------------------------------------------------------------------

, declar pe propria răspundere că această lucrare este rezultatul
propriei activități intelectuale, pe baza cercetărilor mele și pe baza
informațiilor obținute din surse care au fost citate, în textul lucrării
și în bibliografie.\
Declar că această lucrare nu conține porțiuni plagiate, iar sursele
bibliografice au fost folosite cu respectarea legislației române și a
convențiilor internaționale privind drepturile de autor.\
Declar, de asemenea, că această lucrare nu a mai fost prezentată în fața
unei alte comisii de examen de licență.\
În cazul constatării ulterioare a unor declarații false, voi suporta
sancțiunile administrative, respectiv, *anularea examenului de licență*.
:::

Data Nume, Prenume

------------------------------------------------------------------------

------------------------------------------------------------------------

Semnătura

# Introducere

## Contextul proiectului

Evoluția rețelelor de utilități de la sisteme pasive de distribuție la
sisteme inteligente și receptive se bazează fundamental pe fluxul de
date de înaltă rezoluție. O motivație centrală a acestei evoluții o
reprezintă necesitatea urgentă de a identifica, cuantifica și diminua
pierderile din rețea. În sistemele de distribuție tradiționale,
operatorii se confruntă cu un nivel ridicat de ineficiență cauzat pe de
o parte de pierderile tehnice (energia disipată fizic în conductoare și
echipamente de transformare), iar pe de altă parte de pierderile
comerciale sau non-tehnice (sustrageri frauduloase de energie, erori de
metrologie sau consum neînregistrat). Fără o vizibilitate granulară și
continuă asupra bilanțului energetic, depistarea acestor anomalii este
ineficientă.

Această tranziție către rețele digitalizate este accelerată la nivel
european de directivele din Pactul Verde European (European Green Deal),
care impun transformarea sistemului energetic dintr-un model liniar,
puternic centralizat, într-un ecosistem descentralizat și digitalizat
[@eu_green_deal]. În centrul acestei transformări se află Infrastructura
Avansată de Contorizare (AMI - Advanced Metering Infrastructure), un
sistem complex care permite comunicarea bidirecțională între furnizorii
de utilități și consumatori.

Spre deosebire de sistemele moștenite de citire automată a contoarelor
(AMR - Automated Meter Reading), care au fost concepute primar pentru
colectarea unidirecțională a datelor exclusiv în vederea facturării, AMI
facilitează un schimb dinamic de informații. Această tehnologie
deblochează capacități critice pentru conceptul de \"Smart Grid\",
precum conectarea și deconectarea de la distanță, implementarea
programelor de tip \"demand-response\", detectarea rapidă a
întreruperilor și oferirea de feedback în timp real consumatorilor
privind amprenta lor energetică.

Mai mult, apariția și expansiunea conceptului de \"prosumator\"
(consumator care produce energie, de regulă prin sisteme fotovoltaice
distribuite) a complicat managementul rețelelor electrice de joasă
tensiune. Fără o vizibilitate clară, în timp real, la nivelul punctelor
de consum și injecție, rețelele de distribuție riscă dezechilibre
majore. Astfel, contorul inteligent a încetat să mai fie un simplu
senzor, devenind o componentă activă de control a rețelei.

În contextul actual, eficiența energetică și digitalizarea serviciilor
de utilități au devenit priorități strategice la nivel global și,
implicit, în România. Cadrul legislativ actual, precum Directiva (UE)
2023/1791 privind eficiența energetică [@eu_directive_2023], stipulează
clar obligația ca sistemele de contorizare să furnizeze clienților
finali informații precise și transparente privind consumul real. Această
abordare are rolul de a stimula ajustarea comportamentală a
consumatorilor și reducerea risipei. Integrarea acestor sisteme avansate
răspunde direct nevoii de a monitoriza precis consumul, de a gestiona
resursele distribuite și de a eradica pierderile din rețea prin
adoptarea unor tehnologii de comunicație robuste, profund penetrante și
scalabile.

### Schimbarea de paradigmă: Integrarea prosumatorilor și resursele distribuite

Tranziția energetică modernă este definită de trecerea de la un model de
generare centralizat (unde energia curge unidirecțional de la marii
producători către consumatori) la un model descentralizat, marcat de
proliferarea Resurselor Energetice Distribuite (DER - Distributed Energy
Resources). În acest context, un rol central îl ocupă \"prosumatorul\"
--- entitatea care nu doar consumă, ci și injectează energie înapoi în
rețea, de regulă prin intermediul sistemelor fotovoltaice rezidențiale.

Această schimbare bidirecțională a fluxului de putere (reverse power
flow) introduce provocări tehnice severe pentru operatorii de
distribuție. Rețelele de joasă tensiune, proiectate inițial pentru un
flux predictibil și unidirecțional, se confruntă acum cu fluctuații
abrupte de tensiune și dezechilibre la nivelul posturilor de
transformare, cauzate de variațiile meteorologice care afectează
producția solară. Astfel, contorizarea inteligentă cu rezoluție ridicată
nu mai este doar un instrument de facturare, ci devine o componentă
critică de siguranță. Fără vizibilitate în timp real asupra injecției și
consumului la nivel granular, rețeaua riscă instabilitate majoră,
justificând pe deplin necesitatea unor infrastructuri de comunicație
precum LoRaWAN, capabile să raporteze starea rețelei la intervale de
ordinul minutelor.

## Provocări actuale în digitalizarea rețelelor energetice

Implementarea la scară largă a sistemelor AMI generează un set nou de
provocări inginerești, trecând de la bariere fizice la provocări de
ordin informațional. Colectarea datelor la intervale de 15 minute (sau
chiar mai des) de la sute de mii de contoare transformă rețeaua de
distribuție într-un generator masiv de serii de timp (Time-Series Data).

Principalele deficiențe ale abordărilor convenționale includ:

- **Congestia spectrului de comunicație:** Tehnologiile celulare
  tradiționale (GSM, LTE) implică un overhead semnificativ la nivel de
  protocol și costuri recurente mari de operare, nefiind scalabile
  pentru densități mari de senzori care transmit pachete mici de date.

- **Arhitecturi software monolitice:** Sistemele moștenite de tip MDM
  (Meter Data Management) utilizează adesea baze de date relaționale
  clasice, care nu sunt optimizate pentru ingestia și interogarea de
  mare viteză a volumelor uriașe de date metrice temporale.

- **Lipsa predictibilității:** Deși se colectează date istorice,
  majoritatea soluțiilor actuale oferă doar o funcție de raportare
  (analiză descriptivă), lipsind instrumentele de machine learning
  necesare pentru predicția consumului (analiză predictivă) și
  anticiparea vârfurilor de sarcină.

Depășirea acestor limitări necesită o schimbare de paradigmă
arhitecturală, orientându-se către microservicii, protocoale dedicate
pentru IoT (precum MQTT și LoRaWAN) și sisteme de persistență poliglote
(Polyglot Persistence), capabile să separe datele tranzacționale de
seriile de timp.

## Impactul socio-economic și de mediu

Implementarea unei platforme integrate de monitorizare energetică
transcede beneficiile de ordin tehnic, generând efecte cuantificabile la
nivel ecologic și socio-economic. Prin transparentizarea fluxurilor de
date și expunerea acestora printr-o interfață web reactivă, utilizatorii
finali dobândesc vizibilitatea necesară pentru a-și optimiza profilul de
consum. Această ajustare comportamentală conduce direct la diminuarea
costurilor la nivel de gospodărie și, agregat, la reducerea amprentei de
carbon a sistemului energetic.

Din perspectiva operatorilor de distribuție (DSO - Distribution System
Operators), o astfel de infrastructură reduce masiv costurile
operaționale logistice (OPEX) prin eliminarea deplasărilor pe teren
pentru citirile manuale (truck rolls). Totodată, capacitatea platformei
de a analiza seriile de timp în timp real facilitează identificarea
imediată a anomaliilor. Acest lucru permite o reacție rapidă în cazul
pierderilor tehnice de energie din rețea sau a tentativelor de furt de
energie (non-technical losses).

Nu în ultimul rând, prin implementarea unor algoritmi de predicție a
consumului pe baza datelor istorice, sistemul sprijină stabilizarea
rețelei în perioadele de cerere maximă (peak shaving). Anticiparea
consumului permite operatorilor o alocare mai eficientă a resurselor și
maximizează gradul de integrare a energiei din surse regenerabile
fluctuante.

# Scopul și obiectivele proiectului

## Scopul proiectului

Scopul principal al acestei lucrări este proiectarea și implementarea
unei platforme software integrate pentru contorizarea inteligentă,
bazată pe protocolul LoRaWAN. Sistemul propus urmărește să simuleze
întregul lanț de comunicație, de la generarea datelor de consum la
nivelul contorului, până la vizualizarea acestora într-o interfață web
modernă.

Proiectul vizează demonstrarea viabilității unei arhitecturi software
moderne, bazată pe microservicii și containere, capabilă să gestioneze
fluxuri de date de serie temporală (time-series) și să ofere
utilizatorilor informații în timp real despre consumul de energie.

## Obiectivele proiectului

Pentru atingerea scopului propus, au fost stabilite următoarele
obiective specifice, aliniate cu cerințele funcționale și tehnice ale
unei infrastructuri moderne de tip AMI:

1.  **Dezvoltarea Stratului de Simulare și Rețea:** Implementarea unui
    mediu de simulare realist utilizând *LWN-Simulator* pentru a genera
    trafic LoRaWAN valid (inclusiv criptare și pachete RF simulate).
    Configurarea unui server de rețea privat (*ChirpStack*) pentru
    gestionarea dispozitivelor, validarea pachetelor și decriptarea
    datelor conform standardelor de securitate OTAA (Over-the-Air
    Activation).

2.  **Implementarea unei Arhitecturi Backend Unificate:** Dezvoltarea
    unei aplicații full-stack utilizând framework-ul *Next.js*.
    Backend-ul va funcționa ca un hub central de procesare, integrând un
    client MQTT pentru ingestia datelor în timp real de la serverul de
    rețea ChirpStack.

3.  **Persistența Hibridă a Datelor:** Proiectarea și implementarea unei
    strategii de stocare a datelor care utilizează două tipuri de baze
    de date, optimizate pentru sarcini specifice:

    - **InfluxDB:** Pentru stocarea eficientă a seriilor de timp (citiri
      ale contoarelor, metrici de rețea).

    - **PostgreSQL:** Pentru gestionarea datelor relaționale, a
      metadatelor dispozitivelor și a conturilor de utilizator.

4.  **Realizarea Interfeței Utilizator (Dashboard):** Crearea unei
    interfețe web intuitive (Frontend React) care să permită
    vizualizarea datelor. Un obiectiv cheie este implementarea
    actualizărilor în timp real folosind tehnologia *Server-Sent Events
    (SSE)*, eliminând necesitatea reîncărcării paginii pentru a vedea
    noile citiri ale contoarelor.

5.  **Integrarea Analizei Predictive (Componentă AI):** Implementarea
    unui modul de prognoză a consumului utilizând algoritmi de tip
    ARIMA. Acesta va analiza datele istorice stocate în InfluxDB pentru
    a genera predicții privind consumul viitor, oferind valoare adăugată
    platformei.

## Rezultate așteptate

În urma implementării, platforma va oferi un flux complet de date
funcțional (\"End-to-End\"), demonstrând capacitatea de a prelua pachete
LoRaWAN criptate, de a le procesa și de a le afișa utilizatorului final
într-un timp foarte scurt.

Sistemul va valida conceptul de \"Infrastructure Ownership\" pentru
utilități, demonstrând cum se poate construi o rețea privată de
contorizare folosind componente open-source și standarde industriale,
fără costuri recurente către operatori de telefonie mobilă.

## Motivația alegerii temei

Prezenta lucrare își propune să abordeze provocările tehnice și
arhitecturale ale implementării unei platforme de contorizare
inteligentă, adoptând o strategie inginerească de tip
\"Software-First\". În mod tradițional, dezvoltarea sistemelor IoT pune
accentul inițial pe componenta hardware (contoare fizice, gateway-uri
RF), abordare care introduce adesea limitări și întârzieri cauzate de
procurarea echipamentelor, depanarea radio (RF) și constrângerile de
acoperire geografică în faza de testare.

Prin contrast, prezenta lucrare transferă centrul de greutate către
stratul de aplicație, arhitectura datelor și infrastructura de rețea.
Prin simularea comportamentului contoarelor și al gateway-urilor
utilizând un mediu dedicat capabil să genereze trafic LoRaWAN criptat și
valid conform standardelor, proiectul facilitează validarea rapidă a
unui sistem backend complex.

Motivația principală constă în demonstrarea viabilității unui flux
complet de date (\"End-to-End\") în timp real. Lucrarea se concentrează
pe provocările critice de software: orchestrarea serverului de rețea
(ChirpStack), ingestia asincronă prin protocolul MQTT, persistența
poliglotă a datelor (separând seriile de timp de datele relaționale) și
expunerea informațiilor către utilizator fără latență, utilizând
Server-Sent Events (SSE). Astfel, proiectul oferă o soluție modernă,
scalabilă și modulară, pregătită pentru o eventuală integrare directă
(Plug-and-Play) cu infrastructuri fizice standardizate din industria
energetică.

# Studiu bibliografic

## Evoluția sistemelor de monitorizare energetică

Tranziția rețelelor electrice clasice către rețelele inteligente (Smart
Grids) depinde fundamental de evoluția tehnologiilor de contorizare.
Literatura de specialitate descrie această transformare tehnologică în
trei etape majore: citirea manuală a contoarelor (MMR - Manual Meter
Reading), citirea automată (AMR - Automated Meter Reading) și actualul
standard reprezentat de Infrastructura Avansată de Contorizare (AMI -
Advanced Metering Infrastructure) [@masukume2026towards].

### De la sistemele tradiționale la citirea automată (AMR)

Sistemele din generația AMR au reprezentat primul salt tehnologic
semnificativ în domeniu, având ca scop principal eliminarea erorilor
umane și reducerea costurilor logistice asociate deplasării fizice a
personalului. Acestea au introdus colectarea datelor de consum prin
intermediul frecvențelor radio, utilizând adesea tehnici de tip
„drive-by" sau „walk-by", unde un receptor mobil captează pachetele de
date emise de contoarele din proximitate.

Deși acest nivel de automatizare a eficientizat masiv procesul de
facturare, din perspectiva managementului modern al rețelelor,
tehnologia AMR prezintă o vulnerabilitate arhitecturală majoră:
comunicația este strict unidirecțională. Contorul funcționează ca un
simplu emițător de telemetrie, iar sistemul centralizat (operatorul) nu
are capacitatea de a transmite comenzi înapoi către dispozitiv pentru
a-i ajusta parametrii sau pentru a executa operațiuni de la distanță
[@ytl2026amr].

### Infrastructura Avansată de Contorizare (AMI)

Pentru a face față provocărilor generate de rețelele energetice
moderne---precum integrarea surselor de energie regenerabilă fluctuantă
și expansiunea prosumatorilor---a fost imperativă trecerea la tehnologia
AMI. Această generație schimbă complet paradigma operațională prin
introducerea comunicației bidirecționale constante.

Această arhitectură transformă contorul inteligent dintr-un simplu
senzor pasiv într-un nod activ al rețelei. Operatorii pot acum nu doar
să citească indexul de consum în timp real, ci și să interacționeze
direct cu echipamentul. Printre facilitățile deblocate se numără
posibilitatea de conectare și deconectare a consumatorilor de la
distanță, actualizarea de firmware (over-the-air) și implementarea
programelor dinamice de tarifare. Astfel, AMI devine fundamentul digital
necesar pentru echilibrarea cererii cu oferta de energie
[@evolution2016smart].

### Integrarea multi-utilitară și perspectiva Smart City

Evoluția infrastructurilor AMI depășește granițele sectorului electric.
Literatura recentă evidențiază ineficiența menținerii unor rețele de
comunicație paralele și izolate pentru diferitele utilități publice, cum
ar fi energia electrică, apa și gazele naturale. Întrucât aceste
servicii sunt adesea administrate la nivel municipal sau regional,
tendința actuală vizează unificarea fluxurilor de date sub o platformă
unică de comunicație.

O astfel de abordare holistică promite nu doar reduceri considerabile
ale costurilor de implementare și operare, ci și o gestionare superioară
a resurselor la nivel de \"Smart City\" [@masukume2026towards]. În acest
context teoretic, prezenta lucrare propune o soluție tehnică concretă:
utilizarea standardului LoRaWAN ca strat de comunicație unificat,
capabil să susțină cu succes acest ecosistem integrat, indiferent de
tipul utilității monitorizate.

### Standardizarea la nivel european: Protocolul OMS (Open Metering System)

Dezvoltarea rețelelor inteligente de contorizare în Europa a scos la
iveală necesitatea critică a interoperabilității. Dincolo de tehnologia
de transmisie radio utilizată, formatul în care sunt structurate datele
reprezintă un factor determinant pentru succesul implementărilor la
scară largă. În acest sens, protocolul OMS (Open Metering System) a
devenit standardul european fundamental, fiind conceput pentru a elimina
dependența de un singur producător (fenomenul de vendor lock-in).

Bazat pe standardul de comunicație EN 13757 (M-Bus), OMS unifică
schimbul de date pentru toate tipurile de utilități (energie electrică,
gaze naturale, apă și energie termică) sub un limbaj comun
[@oms_specification]. Din perspectiva arhitecturii de rețea, OMS
operează la nivelul stratului de aplicație.

Pentru a îmbina robustețea formatului OMS cu avantajele de acoperire
radio ale rețelelor LPWAN, alianțele tehnologice au standardizat recent
specificația *OMS over LoRaWAN*. Această arhitectură hibridă utilizează
un strat de adaptare (MBAL) care permite împachetarea telegramelor M-Bus
securizate direct în payload-ul pachetelor LoRaWAN. Adoptarea acestui
standard permite companiilor de utilități să mențină structurile de date
consacrate în sistemele lor de facturare, profitând simultan de
infrastructura radio modernă și cost-eficientă oferită de LoRaWAN.

## Evaluarea protocoalelor LPWAN în aplicații IoT industriale

Implementarea la scară largă a sistemelor AMI necesită o infrastructură
de comunicație capabilă să gestioneze simultan zeci de mii de noduri
dispersate pe arii geografice extinse. De asemenea, aceste rețele
trebuie să asigure o penetrare profundă a semnalului, întrucât
contoarele sunt frecvent amplasate în medii cu atenuare masivă, cum ar
fi subsolurile clădirilor sau cutiile metalice de distribuție.

Deși tehnologiile tradiționale celulare (GSM, 4G/LTE) oferă rate de
transfer ridicate, ele sunt ineficiente din punct de vedere energetic și
generează costuri de operare disproporționate pentru pachete de date de
dimensiuni mici. Ca răspuns la aceste limitări, standardele din clasa
LPWAN (Low-Power Wide-Area Network) s-au impus ca soluții de referință
pentru aplicațiile industriale de tip Smart Grid [@future2024lpwan].
Dintre acestea, cele mai proeminente tehnologii analizate în literatura
de specialitate sunt NB-IoT, Sigfox și LoRaWAN.

### Limitările soluțiilor bazate pe infrastructuri publice

Arhitecturile de comunicație NB-IoT (Narrowband IoT) și Sigfox, deși
performante în anumite scenarii de utilizare, prezintă dezavantaje
structurale atunci când sunt aplicate în ecosistemul utilităților.

NB-IoT este un protocol standardizat de 3GPP care funcționează exclusiv
în benzi de frecvență licențiate și este gestionat de operatorii de
rețele mobile. Principalul său avantaj este lățimea de bandă superioară
și calitatea garantată a serviciului (QoS). Cu toate acestea, din cauza
sincronizării continue cu rețeaua celulară, nodurile NB-IoT au un consum
energetic mai ridicat. Mai mult, dependența de o cartelă SIM pentru
fiecare contor inteligent introduce costuri recurente de abonament,
transformând cheltuielile de operare (OPEX) într-o povară financiară
majoră pentru companiile de utilități.

La polul opus se află Sigfox, un protocol care operează în benzi
nelicențiate și este renumit pentru consumul extrem de redus de energie.
Totuși, arhitectura sa impune restricții tehnice severe: dimensiunea
maximă a payload-ului este limitată la 12 bytes, iar numărul de mesaje
zilnice este strict reglementat. În plus, Sigfox este o rețea complet
proprietară și închisă, utilizatorii depinzând exclusiv de acoperirea
oferită de compania mamă
[@comparison2023nbiot; @tektelic2025comparison].

### Echilibrul tehnologic oferit de LoRaWAN

Spre deosebire de alternativele menționate, LoRaWAN oferă un compromis
tehnic ideal între raza de acoperire, consumul de energie și capacitatea
de transfer a datelor. La nivelul stratului fizic, utilizarea modulației
cu spectru împrăștiat (Chirp Spread Spectrum) îi conferă o imunitate
ridicată la interferențe și o penetrare excelentă a obstacolelor fizice.

Conform testelor de performanță, acest protocol permite transmiterea de
pachete suficient de mari pentru a încapsula întreaga telemetrie a unui
contor inteligent (index, tensiune, curent, alerte). Un alt aspect
critic este securitatea: LoRaWAN integrează nativ algoritmi de criptare
avansată (AES-128) end-to-end pe un hardware cu resurse computationale
limitate, asigurând astfel confidențialitatea datelor sensibile ale
consumatorilor [@mcweeney2024analysis].

### Importanța proprietății asupra infrastructurii (Infrastructure Ownership)

Principalul argument decizional pentru care tehnologia LoRaWAN a fost
selectată pentru dezvoltarea prezentei lucrări de licență nu este doar
de natură tehnică, ci și arhitecturală, rezidând în conceptul de
„Infrastructure Ownership" (proprietatea asupra rețelei).

În timp ce NB-IoT și Sigfox forțează companiile să închirieze accesul la
o infrastructură publică (terță parte), standardul LoRaWAN permite
implementarea și administrarea unor rețele complet private. O companie
de utilități poate achiziționa și instala propriile gateway-uri și
propriul server de rețea. Această abordare elimină complet costurile
recurente de comunicație (zero OPEX pe transmisie), oferă un control
absolut asupra rutării pachetelor de date și garantează că datele nu
părăsesc niciodată rețeaua internă a companiei [@thethings2025private].

Prin urmare, arhitectura sistemului propus în această lucrare simulează
exact acest mediu: o rețea LoRaWAN privată, gestionată complet local,
care validează viabilitatea independenței tehnologice în sectorul
utilităților.

### Rolul strategic al tehnologiei LoRaWAN în sectorul utilităților

Analiza literaturii de specialitate evidențiază faptul că, pentru a
adresa cerințele stringente de comunicație specifice sistemelor AMI,
protocoalele din clasa LPWAN s-au impus ca standard de facto în
ingineria sistemelor distribuite. În acest peisaj tehnologic, LoRaWAN
oferă o arhitectură optimizată, capabilă să balanseze matematic
compromisul dintre comunicația pe distanțe lungi, un consum energetic
extrem de redus și utilizarea eficientă a spectrului radio nelicențiat
(în speță, banda ISM EU863-870 MHz la nivel european)
[@future2024lpwan].

Din perspectivă macroeconomică și operațională, studiile de fezabilitate
relevă un avantaj critic al utilizării LoRaWAN în raport cu tehnologiile
celulare dedicate segmentului IoT, cum ar fi NB-IoT sau LTE-M. Acest
avantaj rezidă în posibilitatea companiilor de utilități de a
implementa, deține și administra integral propria infrastructură de
comunicație (modelul de rețea privată). O astfel de autonomie
structurală elimină complet dependența de acoperirea geografică
discontinuă a operatorilor de telecomunicații terți și anulează
costurile operaționale recurente (OPEX) asociate abonamentelor de date
per dispozitiv [@thethings2025private].

Suplimentar, la nivelul stratului fizic, utilizarea modulației cu
spectru împrăștiat (Chirp Spread Spectrum) asigură un buget de legătură
(link budget) ridicat și o imunitate nativă la interferențele
electromagnetice. Datele empirice din rețelele de distribuție confirmă
că această robustețe structurală asigură o penetrare superioară a
semnalului în medii cu atenuare masivă. Prin urmare, tehnologia se
dovedește optimă pentru monitorizarea punctelor de delimitare critice,
cum sunt contoarele de energie electrică sau apă amplasate în cutii
metalice, subsoluri tehnice adânci sau zone rurale izolate, medii în
care semnalul celular tradițional este adesea instabil sau complet
inexistent.

### Constrângeri legislative și reglementarea spectrului radio (Duty Cycle)

Un aspect critic în evaluarea și proiectarea rețelelor LoRaWAN în Europa
îl reprezintă reglementările impuse de Institutul European de
Standardizare în Telecomunicații (ETSI) privind utilizarea benzilor
nelicențiate ISM (Industrial, Scientific and Medical). Pentru banda
EU863-870 MHz, transmisia radio nu este complet liberă, ci este supusă
unor constrângeri stricte de acces la canal, cunoscute sub denumirea de
ciclu de funcționare (Duty Cycle) [@etsi_duty_cycle].

Conform reglementărilor, un dispozitiv terminal (ex. un contor
inteligent) poate transmite date doar pentru un anumit procent de timp.
Pentru sub-banda principală utilizată de LoRaWAN (868.1 - 868.5 MHz),
limita de Duty Cycle este de $1\%$. Matematic, acest lucru înseamnă că
dintr-o fereastră de o oră (3600 secunde), un dispozitiv are permisiunea
de a emite semnal radio pentru maximum 36 de secunde. Această restricție
hardware și legislativă are un impact direct asupra designului
aplicațiilor AMI. Arhitectura sistemului trebuie să optimizeze riguros
dimensiunea payload-ului (prin tehnici de parsare și compresie la nivel
de bit) și să adapteze frecvența transmisiilor (ex. raportarea
consumului la fiecare 15 minute), astfel încât timpul de transmisie
(Time-on-Air) cumulat să nu depășească limita legală. În caz contrar,
modulele radio vor refuza transmisiile ulterioare până la resetarea
ferestrei de timp, ducând la pierderea telemetriei.

## Arhitecturi de baze de date pentru stocarea seriilor de timp

Implementarea la scară largă a sistemelor de contorizare inteligentă
transformă rețelele de distribuție în veritabile generatoare de volume
masive de date. Un singur contor care raportează parametri electrici la
intervale de 15 minute va produce zeci de mii de înregistrări anual.
Agregând aceste date la nivelul unei municipalități, volumul
informațional devine copleșitor, fapt ce impune o reevaluare profundă a
paradigmelor clasice de stocare și procesare.

### Limitările bazelor de date relaționale în contextul IoT

Pilonul central al aplicațiilor software tradiționale a fost, timp de
decenii, baza de date relațională (RDBMS), precum PostgreSQL sau MySQL.
Aceste sisteme sunt proiectate excelent pentru a asigura integritatea
tranzacțională (standardul ACID) și pentru a menține consistența
relațiilor complexe dintre entități (de exemplu, legătura dintre un
utilizator și facturile sale).

Cu toate acestea, arhitectura strict relațională întâmpină obstacole
severe în ecosistemul IoT. Motoarele RDBMS utilizează, în general,
structuri de tip arbore (B-Tree) pentru indexarea datelor. Într-un
scenariu în care mii de senzori încearcă să scrie simultan și continuu
parametri de telemetrie, aceste structuri de indexare trebuie
actualizate constant. Acest proces generează blocaje concurente (index
locking) la scriere și un consum masiv de resurse, ducând la degradarea
rapidă a performanței generale a sistemului și la imposibilitatea
scalării orizontale [@wlostowska2023comparison].

### Optimizarea prin motoare Time-Series (TSDB)

Pentru a soluționa congestia generată de ingestia masivă, literatura de
specialitate recomandă tranziția către baze de date specializate pentru
serii temporale (TSDB - Time-Series Database). Spre deosebire de
sistemele relaționale, un TSDB tratează amprenta de timp (timestamp-ul)
ca pe elementul fundamental al arhitecturii sale.

Soluții moderne din această categorie, precum InfluxDB, sunt optimizate
nativ pentru operațiuni de tip „append-only" (adăugare continuă de date
noi, fără modificarea celor vechi), absorbind cu ușurință un flux uriaș
de scrieri pe secundă. În plus, arhitectura TSDB integrează algoritmi de
compresie capabili să stocheze istoric vast pe un spațiu de disc minim.
Un alt avantaj major îl reprezintă politicile automate de retenție și
funcțiile de „downsampling". Acestea permit reducerea rezoluției datelor
vechi (de exemplu, agregarea a zeci de citiri per oră într-o singură
medie zilnică) pentru a eficientiza stocarea, menținând totodată latențe
de răspuns de ordinul milisecundelor la interogările analitice
[@influxdata2024tsdb].

### Persistența Poliglotă ca paradigmă arhitecturală

Plecând de la premisa că nicio bază de date nu este universal valabilă
pentru toate tipurile de sarcini, cea mai robustă strategie identificată
în mediul academic și industrial este persistența poliglotă („Polyglot
Persistence"). Această paradigmă presupune utilizarea hibridă și
simultană a mai multor motoare de baze de date în cadrul aceleiași
platforme, delegând fiecăruia exclusiv sarcina pentru care a fost
optimizat.

Prezenta lucrare adoptă și validează practic această strategie
arhitecturală de vârf. Pe de o parte, motorul TSDB (InfluxDB) este
dedicat exclusiv ingestiei de înaltă frecvență a telemetriei brute
(tensiune, curent, index de consum). Pe de altă parte, baza de date
relațională (PostgreSQL) gestionează strict componenta de logică a
aplicației: autentificarea utilizatorilor, inventarul contoarelor
(DevEUI) și gestiunea tarifelor. Această decuplare arhitecturală
protejează experiența utilizatorului final; chiar și în momentele de
vârf, când platforma procesează simultan pachete de la mii de contoare,
interfața web rămâne fluidă, deoarece interogările critice rulează pe
medii izolate [@wlostowska2023comparison].

## Tehnici de predicție a consumului energetic

Odată cu tranziția către infrastructurile de tip Smart Grid, datele de
telemetrie nu mai sunt privite ca simple înregistrări contabile, ci ca o
resursă informațională vitală pentru planificarea strategică. Analiza
predictivă a consumului reprezintă treapta superioară de valorificare a
acestor date, transformând monitorizarea pur reactivă într-o abordare
proactivă.

### Rolul prognozei pe termen scurt (STLF) în echilibrarea rețelei

În contextul rețelelor moderne, caracterizate de volatilitatea generată
de sursele de energie regenerabilă și de variațiile impredictibile de
consum, capacitatea de a anticipa cererea de energie a devenit o
necesitate critică. Prognoza pe termen scurt (STLF - Short-Term Load
Forecasting) permite operatorilor de distribuție să anticipeze
fluctuațiile din rețea cu ore sau zile în avans.

Prin corelarea resurselor energetice disponibile cu cererea estimată,
operatorii pot implementa strategii de gestionare a cererii, precum
„peak shaving" (aplatizarea vârfurilor de sarcină). Această abordare
previne suprasolicitarea fizică a transformatoarelor, reduce pierderile
din rețea și minimizează necesitatea achiziționării de energie scumpă la
ore de vârf [@load2024forecasting].

### Paradigme algoritmice în literatura de specialitate

Domeniul analizei predictive oferă o gamă variată de algoritmi, clasați
majoritar în modele de învățare profundă (Deep Learning) și metode
statistice clasice. Rețelele neuronale profunde (precum LSTM sau
Transformer) excelează la agregarea datelor pe zone macroscopice, dar
necesită putere computațională masivă. Mai mult, la nivelul unui singur
contor, unde datele prezintă zgomot stocastic, aceste arhitecturi sunt
predispuse la supra-antrenare (overfitting) [@load2024forecasting].

În contrast, metodele statistice (precum Netezirea Exponențială sau
modelele Auto-Regresive) respectă principiul parsimoniei matematice.
Acestea oferă un raport superior între precizia predictivă pe termen
scurt și costul computațional, fiind soluții ideale pentru rețelele IoT
unde calculele trebuie rulate rapid și asincron pentru mii de noduri
individuale [@forecasting2025trends].

### Trecerea de la monitorizare pasivă la analiză proactivă

Sistemele clasice de monitorizare operează reactiv, datele fiind
utilizate exclusiv post-factum pentru facturare. Prezenta lucrare
propune tranziția către o paradigmă proactivă, prin integrarea unui
modul predictiv la nivelul stratului server (Backend). Această abordare
generează avantaje pe două planuri complementare:

1.  **Pentru utilizatorul final:** Transformă aplicația într-un
    instrument activ de planificare. Estimarea consumului viitor permite
    utilizatorului să își ajusteze proactiv comportamentul pentru a
    evita tarifele de vârf și a-și optimiza costurile.

2.  **Pentru infrastructura rețelei (Smart Grid):** Facilitează
    managementul cererii (Demand-Side Management). Operatorul poate
    anticipa vârfurile de sarcină și congestiile locale înainte ca
    acestea să provoace pierderi sau suprasolicitări fizice în rețea.

Fundamentarea teoretică, criteriile de selecție și ecuațiile matematice
ale algoritmului predictiv capabil să susțină acest flux vor fi
detaliate pe larg în capitolul de analiză a sistemului propus.

## Analiza platformelor și soluțiilor existente

Pentru a valida deciziile arhitecturale adoptate în prezenta lucrare,
este necesară o raportare la ecosistemul actual de soluții IoT dedicate
monitorizării energetice. Piața de profil este dominată de abordări
divergente, variind de la sisteme comerciale masive și închise, până la
platforme open-source adaptabile. Analiza acestora permite identificarea
limitărilor curente și justifică utilitatea platformei dezvoltate în
cadrul acestui proiect.

### Sisteme Enterprise Proprietare (ex. Landis+Gyr, Itron)

Infrastructurile AMI implementate la scară largă de marile companii de
utilități se bazează, în mod tradițional, pe soluții software și
hardware proprietare (vendor lock-in), cum ar fi platforma Gridstream
dezvoltată de Landis+Gyr. Aceste sisteme enterprise sunt extrem de
robuste și sunt concepute primar pentru a garanta securitatea facturării
și integrarea cu sistemele ERP ale companiilor de distribuție.

Totuși, aceste platforme prezintă limitări semnificative din perspectiva
transparenței și a flexibilității. Ele utilizează adesea standarde de
comunicație închise sau rețele celulare care generează costuri
operaționale recurente masive. Mai mult, accesul utilizatorului final la
propriile date de consum este adesea întârziat și limitat la portaluri
web rigide, fără a oferi o reacție în timp real sau o analiză predictivă
agilă la nivel de consumator individual.

<figure id="fig:landis" data-latex-placement="h">
<img src="./imagini/landis.png" style="width:90.0%" />
<figcaption>Interfața sistemului enterprise Landis+Gyr Gridstream pentru
managementul rețelelor inteligente.</figcaption>
</figure>

### Platforme IoT Open-Source Generice (ex. ThingsBoard)

La polul opus se află platformele IoT open-source, dintre care
ThingsBoard este considerată un standard al industriei. Această
platformă permite conectarea a milioane de dispozitive, ingestia datelor
prin protocoale precum MQTT și crearea de dashboard-uri dinamice.
Arhitectura ThingsBoard validează tehnic conceptul propus în această
lucrare, deoarece și aceasta folosește o persistență poliglotă
(utilizând PostgreSQL pentru entități relaționale și baze de date
NoSQL/TSDB pentru telemetrie).

Cu toate acestea, fiind o platformă cu aplicabilitate generală (de la
agricultură inteligentă la logistică), ThingsBoard este o soluție
complexă și uneori supradimensionată pentru simpla contorizare
energetică. Platforma dezvoltată în prezenta lucrare propune o
alternativă mult mai \"suplă\" și orientată strict pe necesitățile unui
ecosistem Smart Grid, eliminând componentele redundante dintr-un sistem
generalist.

<figure id="fig:thingsboard" data-latex-placement="h">
<img src="./imagini/thingsboard.png" style="width:90.0%" />
<figcaption>Exemplu de dashboard pentru monitorizare IoT realizat în
platforma open-source ThingsBoard.</figcaption>
</figure>

### Sisteme de management energetic local (ex. Home Assistant)

O altă direcție relevantă este reprezentată de platformele axate pe
consumatorul casnic, cel mai elocvent exemplu fiind Home Assistant, prin
intermediul modulului său \"Energy\". Această soluție excelează la
capitolul confidențialitate și proprietate asupra infrastructurii,
permițând utilizatorilor să ruleze sistemul local și să citească datele
contoarelor prin rețele Wi-Fi sau Zigbee locale, utilizând adesea
brokerul MQTT.

Deși oferă o experiență de utilizare excelentă și integrează
funcționalități grafice avansate, abordarea Home Assistant este limitată
geografic la o singură locuință (Local Area Network). Nu poate fi
utilizată de o companie de utilități pentru a gestiona un întreg cartier
sau oraș.

<figure id="fig:homeassistant" data-latex-placement="h">
<img src="./imagini/homeassistent.png" style="width:70.0%" />
<figcaption>Modulul dedicat "Energy" din cadrul platformei locale Home
Assistant.</figcaption>
</figure>

### Poziționarea proiectului propus

Analizând aceste trei direcții, proiectul de față își propune să extragă
și să îmbine cele mai puternice caracteristici ale fiecăreia. Prin
utilizarea tehnologiei LoRaWAN, platforma dezvoltată obține
scalabilitatea pe arii extinse (Wide Area Network) specifică sistemelor
enterprise, dar fără costurile asociate rețelelor celulare. În același
timp, adoptă arhitectura modernă de microservicii și stocare poliglotă
întâlnită în platforme precum ThingsBoard, oferind transparența și
vizibilitatea în timp real caracteristice sistemelor locale de tip Home
Assistant. Această fuziune demonstrează viabilitatea unei rețele AMI
complet private, performante și orientate către utilizator.

# Analiză și fundamentare teoretică a sistemului propus

Acest capitol realizează o analiză aprofundată a conceptelor teoretice
și a modelelor abstracte care stau la baza platformei de monitorizare
energetică dezvoltate. Sunt explorate arhitecturile logice specifice
mediului Internet of Things (IoT), modelele fizice și criptografice ale
protocolului de comunicație LoRaWAN, precum și paradigmele arhitecturale
care fundamentează dezvoltarea interfețelor reactive și persistența
datelor orientate pe serii de timp.

## Sisteme de Contorizare Inteligentă (AMI)

### Definiție și modelare conceptuală

Tranziția globală către rețelele electrice inteligente (Smart Grids) se
fundamentează pe adoptarea Infrastructurii Avansate de Contorizare
(AMI - Advanced Metering Infrastructure). Din perspectivă arhitecturală,
sistemele tradiționale de citire automată (AMR - Automatic Meter
Reading) operau exclusiv ca un model unidirecțional de tip buclă
deschisă (\"open-loop\"), limitându-se la colectarea indexului de
consum. În contrast, AMI reprezintă un model de control cu buclă închisă
(\"closed-loop\"), permițând comunicarea bidirecțională între operatorul
de distribuție și consumator [@ami_survey].

Din punct de vedere sistemic, infrastructura AMI nu se rezumă doar la
hardware, ci reprezintă un ecosistem cibernetic integrat. Acesta include
senzorii de margine (Smart Meters), canalele de telecomunicații,
sistemele centrale de agregare (MDMS - Meter Data Management System) și
platformele analitice care procesează telemetria brută pentru a extrage
informații acționabile.

### Fundamentarea teoretică a monitorizării în timp real

Necesitatea achiziției datelor cu rezoluție temporală ridicată (în timp
real sau aproape real) derivă din provocările fizice și matematice ale
echilibrării unei rețele energetice moderne. Un model optimizat de
monitorizare soluționează următoarele probleme critice:

1.  **Eficiență Energetică și Bucle de Feedback:** Oferirea unui
    feedback imediat și cuantificabil consumatorilor facilitează
    modelarea comportamentului de consum, esențială pentru reducerea
    asimetriilor dintre cerere și ofertă.

2.  **Gestionarea Vârfurilor de Sarcină (Peak Management):** Analiza
    continuă a seriilor de timp permite utilităților să implementeze
    tarife dinamice (Time-of-Use). Această strategie economică are ca
    scop matematic aplatizarea curbei de sarcină (Load Profile),
    prevenind astfel suprasolicitarea fizică a echipamentelor de
    transformare în orele de vârf.

3.  **Detectarea Pierderilor prin Bilanț Energetic:** Utilizând
    principiile legilor lui Kirchhoff la nivelul nodurilor de
    distribuție, sistemul poate identifica rapid pierderile tehnice sau
    fraudele comerciale prin calcularea discrepanțelor dintre fluxul de
    energie injectat de transformator și suma consumurilor înregistrate
    la punctul de delimitare.

<figure id="fig:ami_arch" data-latex-placement="h">
<img src="./imagini/AMI-architecture.png" style="width:90.0%" />
<figcaption>Arhitectura logică a unui sistem AMI integrat în ecosistemul
Smart Grid</figcaption>
</figure>

## Tehnologia de comunicație LoRaWAN

Pentru a conecta contoarele inteligente dispersate geografic, adesea
amplasate în medii cu o atenuare radio masivă (subsoluri, cutii metalice
de distribuție), tehnologiile celulare clasice (GSM/4G) sau Wi-Fi devin
ineficiente din cauza costurilor operaționale și a constrângerilor de
eficiență energetică. Astfel, clasa de rețele LPWAN (Low Power Wide Area
Network) s-a impus ca standard teoretic și industrial, protocolul
LoRaWAN oferind un compromis arhitectural optim între raza de acoperire,
consumul energetic și lățimea de bandă.

### Arhitectură și Principii de Funcționare

Din punct de vedere al modelului OSI, LoRaWAN definește protocolul de
control al accesului la mediu (MAC), fiind construit deasupra modulației
fizice (PHY) LoRa. Baza teoretică a acestei transmisii este tehnica de
spectru împrăștiat denumită CSS (Chirp Spread Spectrum)
[@css_modulation]. Această metodă distribuie spectrul semnalului
original peste o lățime de bandă mai mare prin utilizarea unor
\"chirps\" (semnale cu variație liniară a frecvenței), conferind o
robustețe deosebită la zgomot (Câștig de Procesare).

Principalele caracteristici tehnice și teoretice care recomandă LoRaWAN
pentru ecosistemul Smart Metering sunt:

- **Raza de acțiune extinsă:** Modelul matematic al transmisiei se
  bazează pe ajustarea dinamică a Factorului de Împrăștiere (Spreading
  Factor - SF). Un SF ridicat mărește exponențial sensibilitatea
  receptorului (până la -148 dBm), permițând recepționarea semnalului la
  distanțe de 10-15 km în zone rurale, sacrificând în schimb rata de
  transfer a datelor (Time-on-Air crește).

- **Penetrare profundă:** Modulația CSS este intrinsec rezistentă la
  interferențele multi-cale (multipath fading), fiind capabilă să
  penetreze obstacole dense (beton, pământ), o proprietate vitală pentru
  contoarele montate subteran.

- **Topologie Star-of-Stars:** Spre deosebire de rețelele de tip Mesh,
  nodurile LoRaWAN comunică direct cu gateway-urile utilizând un model
  teoretic asincron de tip \"Pure ALOHA\". Dispozitivele transmit doar
  când au date, eliminând overhead-ul complex de rutare și reducând
  drastic consumul de energie.

<figure id="fig:lora_topo" data-latex-placement="h">
<img src="./imagini/featured_lorawan_architecture_diagram.png"
style="width:90.0%" />
<figcaption>Topologia rețelei LoRaWAN: Dispozitive, Gateway-uri și
Server de Rețea</figcaption>
</figure>

### Securitate și Activare (OTAA)

Într-o infrastructură critică precum cea de utilități, securitatea
datelor necesită o fundamentare criptografică solidă. Modelul
arhitectural LoRaWAN implementează criptografie simetrică (algoritmul
AES-128) pe două niveluri logice decuplate [@lora_alliance_spec]:

- **Network Session Key (NwkSKey):** Calculează un Cod de Autentificare
  a Mesajului (MIC) pentru a asigura autenticitatea nodului și
  integritatea pachetului. Serverul de rețea poate valida sursa, dar nu
  poate decripta conținutul util.

- **Application Session Key (AppSKey):** Asigură criptarea
  \"end-to-end\" a payload-ului efectiv (ex. indexul de consum). Doar
  serverul de aplicație posedă această cheie, garantând
  confidențialitatea datelor metrice față de operatorul infrastructurii
  radio.

Din punct de vedere algoritmic, metoda de conectare utilizată în acest
proiect este **OTAA (Over-The-Air Activation)**. Spre deosebire de
metoda ABP (Activation By Personalization), unde cheile sunt statice,
OTAA presupune un schimb criptografic securizat (Join-Request /
Join-Accept). Pentru a asigura integritatea procesului, algoritmul
folosește un număr pseudo-aleator (`DevNonce`) care previne atacurile
cibernetice de tip \"Replay\", permițând generarea dinamică a noilor
chei de sesiune la fiecare reconectare a dispozitivului. Această
abstractizare face din OTAA standardul absolut pentru implementările de
producție.

### Integritatea pachetelor și prevenirea atacurilor de tip Replay

Dincolo de criptarea conținutului (confidențialitate) garantată de
cheile de sesiune, rețelele Smart Grid trebuie să prevină atacurile
cibernetice de injecție și retransmisie (Replay Attacks). Un astfel de
atac presupune interceptarea unui pachet radio valid de către un actor
malițios și retransmiterea lui ulterioară (ex. transmiterea repetată a
unui pachet vechi care conține o comandă falsă de deconectare a releului
contorului).

Pentru a contracara matematic această vulnerabilitate, stratul MAC al
protocolului LoRaWAN implementează un mecanism strict de contoare de
cadre (Frame Counters): `FCntUp` (pentru mesaje de la contor la server)
și `FCntDown` (pentru mesaje de la server la contor).

La fiecare transmisie nouă, dispozitivul incrementează valoarea
contorului său intern, iar această valoare este inclusă și autentificată
criptografic în structura pachetului radio. Serverul de rețea păstrează
în baza sa de date ultima valoare validă a contorului recepționat de la
acel dispozitiv specific. Dacă serverul primește un pachet cu o valoare
a contorului de cadre mai mică sau egală cu cea înregistrată anterior,
pachetul este considerat compromis (vechi) și este respins instantaneu
(silently dropped). Acest model abstract garantează integritatea
temporală a fluxului de telemetrie și asigură că infrastructura
utilităților nu poate fi perturbată prin injectarea de mesaje
interceptate anterior.

### Comunicația bidirecțională și clasele de dispozitive LoRaWAN

În arhitectura unui sistem Advanced Metering Infrastructure (AMI),
fluxul de date trebuie să fie bidirecțional. Pe lângă achiziția
periodică a telemetriei (Uplink), operatorul rețelei trebuie să poată
transmite comenzi de control către echipamentele terminale (Downlink).
Aceste comenzi pot include actualizări de firmware de tip FUOTA
(Firmware Over-The-Air), modificarea intervalelor de citire sau
acționarea releelor de deconectare a consumatorilor.

Deși protocolul LoRaWAN este asincron și orientat predominant spre
Uplink, el suportă comunicația bidirecțională prin împărțirea
dispozitivelor în trei clase de funcționare, fiecare oferind un
compromis diferit între latența comenzilor și eficiența energetică
[@lora_alliance_spec]:

- **Clasa A (Optimizare energetică maximă):** Este clasa de bază,
  suportată obligatoriu de toate dispozitivele LoRaWAN. Dispozitivul
  poate primi mesaje Downlink de la server doar în două ferestre scurte
  de recepție deschise imediat după transmiterea unui mesaj Uplink.
  Pentru un contor alimentat din baterie (ex. contor de apă), aceasta
  asigură o durată de viață a bateriei de peste 10 ani, dar comenzile de
  la server sunt puse în așteptare (queued) până la următoarea trezire a
  dispozitivului.

- **Clasa B (Recepție programată):** Pe lângă ferestrele din Clasa A,
  dispozitivele din Clasa B deschid ferestre de recepție suplimentare la
  intervale de timp prestabilite, sincronizate prin balize de timp
  (Beacons) transmise de gateway-uri. Această clasă este utilă pentru
  actuatoare care trebuie să răspundă cu o latență predictibilă,
  păstrând totuși un consum redus.

- **Clasa C (Ascultare continuă):** Dispozitivele din această clasă
  mențin fereastra de recepție deschisă permanent, cu excepția
  momentelor în care transmit date. Deși consumul energetic este
  ridicat, această clasă asigură o latență de Downlink aproape nulă.
  Contoarele de energie electrică (Smart Meters), care sunt alimentate
  direct de la rețeaua de curent (mains-powered), operează de regulă în
  Clasa C, permițând operatorilor să execute comenzi critice (precum
  oprirea alimentării la distanță) în timp real.

## Modelul de mediere asincronă și paradigma Publish-Subscribe

În ecosistemul rețelelor de senzori la scară largă, transmiterea
eficientă a telemetriei de la nivelul serverului de rețea (Network
Server) către bazele de date și aplicațiile de consum reprezintă o
provocare arhitecturală majoră. Utilizarea modelului tradițional de
comunicație sincronă este inadecvată pentru un mediu caracterizat prin
volume masive de mesaje concurente.

### Limitările modelului tradițional Client-Server

Modelul clasic de comunicație, bazat pe paradigma \"Request-Response\"
(specifică arhitecturilor REST/HTTP), impune o cuplare strânsă între
entitățile participante. În acest model teoretic, producătorul de date
și consumatorul de date trebuie să comunice sincron: clientul inițiază o
cerere, iar serverul trebuie să fie disponibil pentru a o procesa și a
returna un răspuns.

Translatarea acestui model într-un sistem AMI (unde zeci de mii de
contoare raportează simultan) generează un fenomen de congestie denumit
\"bottleneck\" (gâtuire). Dacă componenta de stocare (baza de date)
devine temporar indisponibilă sau este supraîncărcată, conexiunile TCP
rămân deschise, blocând resursele de rețea și ducând la pierderea
irecuperabilă a pachetelor de telemetrie.

### Arhitectura și dimensiunile decuplării în modelul Pub/Sub

Pentru a soluționa matematic și structural problema congestiei,
platforma dezvoltată adoptă paradigma de comunicare asincronă
\"Publish-Subscribe\" (implementată practic prin protocoale de mesagerie
de tip MQTT). Acest model abstract elimină comunicarea directă
point-to-point, introducând o entitate centrală de mediere denumită
*Broker de mesaje*.

Din perspectivă teoretică, valoarea fundamentală a modelului Pub/Sub
constă în realizarea unei decuplări arhitecturale pe trei dimensiuni
esențiale:

- **Decuplarea spațială (Space Decoupling):** Producătorii de informație
  (Publisherii) și consumatorii (Subscriberii) nu au nevoie să își
  cunoască reciproc adresele de rețea (ex. adresele IP). Ambele entități
  cunosc exclusiv existența Brokerului central.

- **Decuplarea temporală (Time Decoupling):** Părțile comunicante nu
  trebuie să fie active simultan. Brokerul acționează ca un tampon de
  memorie (buffer), capabil să rețină temporar mesajele până când
  serviciul de stocare devine disponibil să le preia.

- **Decuplarea de sincronizare (Synchronization Decoupling):**
  Operațiunile de publicare și abonare nu sunt blocante. Serverul
  LoRaWAN poate \"împinge\" zeci de mii de mesaje către broker fără a
  aștepta un răspuns de confirmare a scrierii lor în baza de date,
  eliberându-și astfel resursele instantaneu.

### Mecanismul de rutare bazat pe topici și justificarea arhitecturală

Rutarea informației în acest model abstract nu se realizează pe baza
adreselor destinație, ci prin intermediul unei filtrări logice,
utilizând o structură ierarhică de *topici* (Topics). Un topic este,
conceptual, un arbore logic de directoare (ex.
`aplicatie/dispozitiv/eveniment`).

În arhitectura platformei propuse, serviciul responsabil de ingestia
datelor (Worker-ul) se abonează la un tipar abstract de topici.
Utilizarea caracterelor wildcard (metacaractere) permite acestui
serviciu unic să intercepteze dinamic telemetria provenită de la orice
contor inteligent nou adăugat în rețea, fără a necesita modificări la
nivelul codului.

Justificarea logică a utilizării acestui mediator asincron este
obținerea **scalabilității orizontale**. Brokerul acționează ca un
sistem de amortizare a șocurilor (shock absorber) între fluxul
impredictibil generat de rețeaua LoRaWAN și constrângerile de scriere
ale bazelor de date, garantând astfel o arhitectură robustă
(fault-tolerant) capabilă să susțină un Smart Grid de dimensiuni
metropolitane.

### Nivelurile de garantare a livrării (QoS) în arhitectura IoT

Robustețea mecanismului Publish-Subscribe, implementat prin protocolul
MQTT, depinde fundamental de managementul calității serviciului (QoS -
Quality of Service). În contextul contorizării inteligente, unde datele
au valoare financiară critică (facturare și echilibrare), pierderea
pachetelor de telemetrie la tranzitarea între serverul de comunicație
LoRaWAN și baza de date InfluxDB este inacceptabilă. Protocolul MQTT
definește trei niveluri teoretice de garantare a livrării:

- **QoS 0 (At most once / Fire and forget):** Mesajul este transmis o
  singură dată. Nu există confirmare de primire de la broker. Este o
  transmisie extrem de rapidă, dar prezintă riscul major al pierderii
  datelor în cazul deconectărilor scurte de rețea.

- **QoS 1 (At least once):** Garantează că mesajul va ajunge la
  destinație cel puțin o dată. Publisher-ul stochează mesajul intern și
  îl retransmite periodic până primește un pachet de confirmare
  obligatorie (`PUBACK`) de la broker.

- **QoS 2 (Exactly once):** Este cel mai înalt și sigur nivel, garantând
  lipsa duplicatelor printr-un proces de confirmare complex în patru
  pași. Totuși, acest mecanism generează un overhead masiv pe rețea,
  nefiind scalabil pentru milioane de senzori.

Pentru arhitectura platformei dezvoltate, a fost selectat modelul **QoS
1**. Această decizie arhitecturală reprezintă compromisul tehnic optim:
asigură garanția absolută că niciun index de consum nu este pierdut
între gateway și baza de date, tolerând în același timp posibilitatea
apariției unor mesaje duplicate (dacă confirmarea a fost întârziată).
Duplicatele sunt gestionate și eliminate eficient (deduplicare logică)
direct la nivelul bazei de date Time-Series, pe baza amprentei de timp
(timestamp) unice atașate fiecărui pachet înregistrat.

## Modelul abstract al stocării și persistenței datelor

Gestionarea volumului masiv de date generat de rețelele de senzori
impune o strategie de stocare specializată. Bazele de date relaționale
clasice (RDBMS), deși esențiale pentru coerența logică a aplicațiilor,
nu sunt optimizate la nivel arhitectural pentru scrieri de înaltă
frecvență și interogări temporale continue.

### Limitările structurilor relaționale și modelul Time-Series (TSDB)

Din punct de vedere matematic și structural, sistemele relaționale
utilizează arbori de căutare (în special structuri de tip B-Tree) pentru
a indexa datele și a menține proprietățile tranzacționale (standardul
ACID). Într-un mediu IoT, unde mii de contoare raportează simultan,
inserția continuă de înregistrări forțează actualizarea și
reechilibrarea constantă a acestor arbori. Acest fenomen generează
blocaje la nivel de index (index locking) și o degradare exponențială a
performanței la scriere.

Pentru a rezolva această limitare teoretică, se utilizează conceptul de
bază de date pentru serii de timp (TSDB). Un TSDB transformă variabila
timp dintr-un simplu atribut într-o axă principală de stocare, utilizând
adesea structuri optimizate pentru operațiuni de adăugare continuă
(append-only), care previn fragmentarea pe disc.

Proprietățile abstracte care definesc acest model includ
[@influx_vs_sql]:

- **Write Throughput maximizat:** Eliminarea blocajelor concurente la
  indexare permite ingestia a zeci de mii de puncte de date pe secundă
  fără penalizări de performanță.

- **Compresie matematică:** Utilizarea unor algoritmi de compresie
  predictivă (precum Delta-of-Delta sau algoritmul Gorilla) care
  stochează doar diferențele de valoare între măsurători consecutive.
  Această tehnică reduce drastic spațiul necesar pentru seriile de date
  repetitive (ex. variații infime ale tensiunii electrice).

- **Politici de Retenție și Agregare:** Mecanisme automate de
  \"downsampling\", care reduc rezoluția datelor istorice prin aplicarea
  unor funcții matematice de agregare (medie, maxim) peste ferestre de
  timp predefinite, eliberând resurse de stocare.

### Modelul logic al Persistenței Poliglote

Pentru a construi o platformă completă și robustă, fundamentarea
teoretică modernă indică utilizarea unei arhitecturi hibride, denumită
\"Persistență Poliglotă\" (Polyglot Persistence). Această paradigmă
presupune alocarea sarcinilor de stocare către modele de date
fundamental diferite, în funcție de natura intrinsecă a informației:

1.  **Modelul Temporal (Stocarea Telemetriei):** Gestionează exclusiv
    evenimentele imuabile generate de rețea. Fiecare tuplu conține o
    amprentă de timp (timestamp), variabile fizice măsurate (energie,
    tensiune, curent) și metadate contextuale de rețea (calitatea
    semnalului radio - RSSI, SNR).

2.  **Modelul Relațional (Stocarea Metadatelor):** Asigură integritatea
    referențială și relațiile logice de tip $1:N$ dintre entități. Aici
    sunt modelate riguros datele tranzacționale de stare: conturile
    utilizatorilor, inventarul fizic al contoarelor și structura
    tarifară.

Sincronizarea logică dintre aceste două medii eterogene se realizează la
nivelul aplicației printr-o cheie de legătură abstractă, reprezentată de
identificatorul hardware unic al contorului (`DevEUI`). Această
decuplare structurală garantează că volumul masiv de telemetrie nu va
bloca sau îngreuna niciodată interogările administrative critice
necesare managementului rețelei.

## Dezvoltarea aplicațiilor web moderne și arhitectura de prezentare

Pentru a vizualiza datele telemetrice, este necesar un strat de
prezentare (Presentation Layer) decuplat conceptual de bazele de date.
Paradigmele actuale de dezvoltare web impun utilizarea unor aplicații
reactive, capabile să proceseze asincron și eficient modelele de date
temporale și relaționale.

### Arhitectura Full-Stack și Modelul de Randare (Next.js)

Aplicațiile clasice de tip SPA (Single Page Application) introduc
latențe specifice în mediul IoT, deoarece browserul trebuie să descarce
și să construiască interfața înainte de a putea iniția extragerea
telemetriei masive. Next.js, un framework bazat pe React, rezolvă
această limitare arhitecturală acționând ca un model de tip
\"Backend-for-Frontend\" (BFF) [@nextjs_handbook].

Avantajele majore ale acestei abordări includ:

- **Server-Side Rendering (SSR):** Modelul inversează fluxul de
  execuție, randând pagina direct pe server. Acest procedeu reduce
  numărul cererilor de rețea și asigură o barieră teoretică de
  securitate: credențialele și cheile de conectare la bazele de date
  sunt procesate exclusiv pe server, nefiind expuse în codul clientului.

- **API Routes (Mediere Logică):** Permite crearea de endpoint-uri
  direct în proiect, eliminând necesitatea unui backend separat.
  Interogările complexe sunt încapsulate aici, returnând frontend-ului
  doar date structurate în format JSON.

### Comunicarea asincronă: Modelul Server-Sent Events (SSE)

Sistemele de monitorizare necesită actualizări instantanee la primirea
noilor citiri. Arhitectura HTTP clasică de tip \"Request-Response\" și
tehnicile de interogare repetată (\"Long-Polling\") generează un
overhead masiv pe rețea din cauza stabilirii repetate a conexiunilor TCP
(mecanismul \"Three-way Handshake\").

Deși WebSockets reprezintă o opțiune populară, pentru fluxurile de date
strict unidirecționale (de la server la client), tehnologia
**Server-Sent Events (SSE)** oferă un model protocolar superior. SSE
utilizează o conexiune HTTP/1.1 persistentă (\"keep-alive\") prin care
serverul transmite asincron pachete de text formatat (tipul MIME
`text/event-stream`).

Avantajele tehnice și logice ale acestei tehnologii includ:

- **Eficiență TCP:** Elimină latența generată de restabilirea
  conexiunilor pentru fiecare citire nouă a contorului.

- **Reziliență:** Protocolul implementează nativ reconectarea automată
  și urmărirea ultimului eveniment (Last-Event-ID), asigurând
  integritatea fluxului de date la scurte întreruperi de rețea.

- **Compatibilitate infrastructură:** Utilizând standardul HTTP pe
  porturile 80/443, SSE traversează nativ proxy-urile și firewall-urile
  corporative, un aspect critic pentru infrastructurile companiilor de
  utilități.

## Analiza comparativă și selecția algoritmului de predicție

Anticiparea comportamentului de consum la nivelul nodurilor de rețea
(Short-Term Load Forecasting) reprezintă o funcționalitate critică a
sistemelor AMI moderne. Pentru a fundamenta alegerea optimă a
algoritmului, prezenta secțiune analizează și compară din punct de
vedere teoretic trei paradigme matematice distincte: un model bazat pe
netezire exponențială (Holt-Winters), un model bazat pe învățare
automată non-liniară (Random Forest) și un model statistic auto-regresiv
(ARIMA).

### Modelul de Netezire Exponențială Triplă (Holt-Winters)

Modelul Holt-Winters este o metodă statistică ce fundamentează predicția
pe ponderarea observațiilor istorice, acordând o importanță exponențial
mai mare datelor recente în raport cu cele îndepărtate. Din punct de
vedere abstract, modelul descompune seria de timp în trei componente
dinamice fundamentale: nivelul de bază ($L_t$), trendul ($T_t$) și
sezonalitatea ($S_t$) [@forecasting2025trends].

Ecuațiile matematice de actualizare ale modelului folosesc trei
parametri de netezire ($\alpha, \beta, \gamma$), cu valori cuprinse în
intervalul $[0, 1]$:
$$L_t = \alpha(Y_t - S_{t-m}) + (1-\alpha)(L_{t-1} + T_{t-1})$$
$$T_t = \beta(L_t - L_{t-1}) + (1-\beta)T_{t-1}$$
$$S_t = \gamma(Y_t - L_{t-1} - T_{t-1}) + (1-\gamma)S_{t-m}$$ unde $m$
reprezintă lungimea ciclului sezonier (ex. 24 de ore pentru consumul
zilnic). Deși Holt-Winters este extrem de eficient computațional și
excelează în capturarea tiparelor sezoniere rigide, el prezintă limitări
majore în Smart Grids atunci când seria de timp prezintă perturbații
abrupte, variații de consum impredictibile sau corelații complexe între
momente de timp adiacente (autocorelații de ordin superior).

### Modelul bazat pe Învățare Automată (Random Forest Regression)

La polul opus se află abordările de învățare automată non-liniară,
dintre care algoritmul Random Forest reprezintă o soluție de ansamblu
extrem de robustă. Conceptual, modelul construiește un număr mare de
arbori de decizie independenți în faza de antrenare și combină
predicțiile acestora (prin mediere) pentru a genera rezultatul final,
reducând astfel riscul de supra-antrenare (overfitting).

Pentru a aplica acest model peste o serie de timp, este necesară
transformarea abstractă a structurii datelor dintr-un șir cronologic
într-o matrice tabulară de caracteristici (feature engineering). Modelul
matematic devine o funcție de mapare:
$$\hat{Y}_{t+h} = f(Y_t, Y_{t-1}, \dots, Y_{t-p}, X_{timp})$$ unde
$X_{timp}$ reprezintă variabile externe vectorizate (cum ar fi ora din
zi sau ziua din săptămână). Random Forest are capacitatea nativă de a
modela relații extrem de complexe și non-liniare de consum și este imun
la problemele de nestaționarietate a datelor. Totuși, dezavantajul său
major rezidă în caracterul de „cutie neagră" (black-box), lipsa
proprietăților statistice formale și, în special, costul computațional
ridicat. Antrenarea și stocarea în memorie a sutelor de arbori pentru
fiecare contor individual în parte contravine principiului unei
arhitecturi software optimizate.

### Modelul Statistic Auto-Regresiv (ARIMA)

Modelul ARIMA (AutoRegressive Integrated Moving Average) abordează
problema prognozei dintr-o perspectivă stocastică liniară, analizând
direct structura internă de dependență (autocorelație) a seriei de timp.
Pentru ca algoritmul să genereze predicții valide, seria de consum este
transformată într-una staționară. Modelul este definit abstract de trei
parametri $(p, d, q)$, ale căror componente matematice structurale sunt:

- *Componenta Auto-Regresivă - AR(p):* Presupune că valoarea curentă
  depinde liniar de observațiile sale anterioare (lag-uri):
  $$Y_t = c + \phi_1 Y_{t-1} + \phi_2 Y_{t-2} + \dots + \phi_p Y_{t-p} + \varepsilon_t$$
  unde $Y_t$ este valoarea la momentul $t$, $c$ este o constantă,
  $\phi_i$ sunt coeficienții, iar $\varepsilon_t$ reprezintă zgomotul
  alb.

- *Componenta de Integrare - I(d):* Reprezintă gradul de diferențiere
  necesar pentru eliminarea trendului și obținerea staționarității:
  $$Y'_t = Y_t - Y_{t-1}$$

- *Componenta de Medie Mobilă - MA(q):* Utilizează dependența dintre o
  observație curentă și erorile de predicție aplicate observațiilor
  anterioare:
  $$Y_t = \mu + \varepsilon_t + \theta_1 \varepsilon_{t-1} + \theta_2 \varepsilon_{t-2} + \dots + \theta_q \varepsilon_{t-q}$$
  unde $\mu$ este media seriei, iar $\theta_i$ sunt parametrii modelului
  de medie mobilă.

### Evaluare comparativă și justificarea alegerii algoritmului

Pentru a selecta modelul optim pentru platforma de monitorizare
dezvoltată, s-a realizat o evaluare comparativă a celor trei paradigme
pe baza constrângerilor arhitecturale ale unui sistem AMI
(scalabilitate, precizie, parsimonie).

::: {#tab:comparatie_modele}
  **Criteriu de evaluare**          **Holt-Winters**      **Random Forest**        **ARIMA (Propus)**
  -------------------------------- ------------------ ------------------------- -------------------------
  Complexitate matematică               Scăzută               Ridicată                  **Medie**
  Cost computațional                     Minim             Foarte ridicat               **Redus**
  Nevoie de date istorice                Medie               Foarte mare           **Redusă / Medie**
  Necesitate Feature Engineering           Nu             Da (Obligatoriu)               **Nu**
  Modelare comportament dinamic          Rigidă        Flexibilă (Non-liniară)   **Flexibilă (Liniară)**
  Scalabilitate pe mii de noduri       Excelentă               Scăzută               **Foarte bună**

  : Evaluare comparativă a modelelor matematice de predicție
:::

Justificarea logică a alegerii modelului ARIMA se fundamentează pe
principiul parsimoniei informaționale și pe constrângerile fizice ale
infrastructurii software dezvoltate. Într-o platformă distribuită unde
predicțiile trebuie rulate independent pentru fiecare contor inteligent
în parte, utilizarea unui model precum Random Forest ar genera o
degradare masivă a performanței serverului din cauza fazelor de
re-antrenare periodică și a consumului ridicat de memorie RAM. Pe de
altă parte, deși modelul Holt-Winters este extrem de rapid, el nu poate
modela oscilațiile fine ale consumului energetic cauzate de modificările
dinamice din rețea.

ARIMA reprezintă compromisul tehnic ideal. Prin utilizarea unui număr
redus de parametri interni $(p, d, q)$, modelul obține o precizie
predictivă ridicată pentru prognozele pe termen scurt (12-24 de ore),
având un footprint computațional minim. Acest lucru permite procesarea
predictivă asincronă direct la nivelul componentelor backend, garantând
o scalabilitate orizontală excelentă a întregului sistem cibernetic.

# Proiectare de detaliu și implementare

## Prezentarea generală a soluției implementate

Capitolul de față descrie proiectarea de detaliu și implementarea
sistemului integrat de monitorizare și gestiune a consumului de
utilități prin rețele LoRaWAN. Spre deosebire de capitolele anterioare,
care au avut rolul de a prezenta fundamentarea teoretică și justificarea
tehnologiilor alese, această parte urmărește descrierea concretă a
aplicației dezvoltate, a componentelor software implementate și a
modului în care acestea interacționează.

Sistemul propus este organizat într-o arhitectură modulară, compusă din
servicii specializate. La nivel funcțional, aplicația permite
monitorizarea mai multor categorii de contoare inteligente,
corespunzătoare utilităților de tip electricitate, gaz, apă, încălzire
și răcire. Fiecare contor este identificat printr-un identificator unic
de tip `devEui`, iar datele transmise de acesta sunt procesate, stocate
și afișate într-un dashboard web.

Din punct de vedere al utilizatorilor, sistemul distinge între trei
categorii principale: administratorul platformei, contul de companie și
utilizatorul individual. Administratorul are rol de gestiune generală,
în timp ce utilizatorii de tip client accesează doar dispozitivele
asociate propriului cont. Contul de companie poate deține o flotă mai
mare de dispozitive, iar utilizatorul individual are acces la un număr
restrâns de contoare, asociate unei locuințe sau unui punct de consum.

Aplicația implementată include un flux complet de procesare, pornind de
la generarea datelor de către un simulator LoRaWAN, continuând cu
transmiterea acestora prin infrastructura ChirpStack și brokerul MQTT,
procesarea printr-un worker dedicat, stocarea în baze de date
specializate și afișarea în interfața web. În plus, sistemul include un
modul de predicție bazat pe modelul ARIMA, care permite estimarea
consumului viitor pe baza datelor istorice.

## Arhitectura generală a aplicației

Arhitectura sistemului este construită în jurul separării
responsabilităților între componente independente. Această abordare
permite înlocuirea sau extinderea unor componente fără modificarea
întregului sistem. De exemplu, simulatorul LoRaWAN poate fi înlocuit
ulterior cu dispozitive fizice, fără ca aplicația web sau baza de date
să necesite modificări majore, deoarece punctul de integrare rămâne
același: infrastructura ChirpStack și mesajele MQTT generate în urma
recepționării uplink-urilor.

Fluxul principal al datelor este următorul: simulatorul LoRaWAN
generează pachete corespunzătoare dispozitivelor definite, acestea sunt
preluate de ChirpStack Gateway Bridge, procesate de serverul ChirpStack
și publicate prin brokerul MQTT. Worker-ul aplicației se abonează la
mesajele publicate, extrage valorile relevante, normalizează structura
datelor și scrie telemetria în InfluxDB. Aplicația web Next.js accesează
PostgreSQL pentru metadate și InfluxDB pentru date istorice, expunând
informațiile către utilizator prin dashboard.

<figure id="fig:arhitectura-generala" data-latex-placement="htbp">

<figcaption>Arhitectura generală a sistemului implementat</figcaption>
</figure>

Tabelul [5.1](#tab:componente-sistem){reference-type="ref"
reference="tab:componente-sistem"} prezintă principalele componente ale
sistemului și responsabilitățile acestora.

::: {#tab:componente-sistem}
  **Componentă**              **Responsabilitate principală**
  --------------------------- -------------------------------------------------------------------------------------------------------------
  LWN Simulator               Generează dispozitive și trafic LoRaWAN simulat, utilizat pentru demonstrarea fluxului fără hardware fizic.
  ChirpStack Gateway Bridge   Primește traficul de tip gateway și îl transmite către infrastructura ChirpStack.
  ChirpStack                  Gestionează rețeaua LoRaWAN, dispozitivele, aplicațiile și publicarea mesajelor uplink.
  Mosquitto MQTT              Broker de mesaje utilizat pentru decuplarea serverului de rețea de componentele aplicației.
  MQTT Worker                 Procesează mesajele publicate de ChirpStack și scrie datele normalizate în InfluxDB.
  PostgreSQL                  Stochează metadatele relaționale: utilizatori, dispozitive, tarife, coordonate și ownership.
  InfluxDB                    Stochează citirile istorice ale contoarelor sub formă de serii de timp.
  Next.js API                 Expune funcționalitățile aplicației web și realizează validarea accesului la date.
  Serviciu ARIMA              Calculează prognoze de consum pe baza seriilor istorice agregate.
  Dashboard Web               Interfața prin care utilizatorul vizualizează dispozitive, consumuri, costuri și predicții.

  : Componentele sistemului și responsabilitățile acestora
:::

Din punct de vedere arhitectural, separarea PostgreSQL și InfluxDB este
justificată de natura diferită a datelor. PostgreSQL este utilizat
pentru date relaționale stabile, precum utilizatori, dispozitive, tarife
și asocieri între entități. InfluxDB este utilizat pentru telemetrie,
deoarece citirile contoarelor sunt valori istorice indexate temporal,
generate frecvent și interogate pe intervale de timp.

## Mediul de simulare LoRaWAN și integrarea cu ChirpStack

În cadrul proiectului, fluxul LoRaWAN este reprodus prin utilizarea unui
simulator. Alegerea acestei abordări este justificată de necesitatea
validării complete a arhitecturii fără dependența de contoare fizice,
gateway-uri reale sau infrastructură radio dedicată. Simulatorul permite
generarea controlată a dispozitivelor, a valorilor transmise și a
poziției geografice asociate fiecărui contor.

Componenta LWN Simulator are rolul de a produce trafic LoRaWAN simulat
pentru mai multe tipuri de dispozitive. Dispozitivele sunt definite
printr-un identificator unic `devEui`, printr-un nume descriptiv, prin
tipul utilității monitorizate și prin coordonate geografice. În
implementarea curentă sunt utilizate cinci categorii principale de
contoare: electricitate, gaz, apă, încălzire și răcire. Categoria
`OTHER` există doar ca valoare de rezervă în modelul de date și nu este
utilizată ca tip principal în demonstrația aplicației.

ChirpStack Gateway Bridge are rolul de a media traficul dintre simulator
și serverul ChirpStack. ChirpStack funcționează ca server de rețea
LoRaWAN, menținând identitatea dispozitivelor și publicând evenimentele
de tip uplink prin MQTT. Astfel, aplicația dezvoltată nu comunică direct
cu simulatorul pentru citiri live, ci primește datele prin același
mecanism care ar fi utilizat și într-o integrare cu dispozitive reale.

<figure id="fig:flux-lorawan-simulat" data-latex-placement="htbp">

<figcaption>Fluxul LoRaWAN simulat până la publicarea mesajelor
MQTT</figcaption>
</figure>

Prin utilizarea metadatelor din ChirpStack, dispozitivele pot transporta
informații suplimentare relevante pentru aplicație, cum ar fi tipul de
utilitate, unitatea de măsură, coordonatele și codul de revendicare.
Această abordare reduce configurarea manuală în aplicația web și permite
sincronizarea mai rapidă a inventarului de dispozitive.

## Modulul de ingestie și procesare a datelor

Modulul de ingestie este implementat printr-un worker Node.js/TypeScript
care se conectează la brokerul MQTT și procesează mesajele publicate de
ChirpStack. Această componentă este esențială deoarece realizează
legătura dintre infrastructura IoT și sistemul de stocare utilizat de
aplicația web.

Worker-ul se abonează la topicurile de uplink și primește mesaje care
conțin identificatorul dispozitivului, datele decodificate și informații
auxiliare. În etapa de procesare, payload-ul este analizat, iar valorile
relevante sunt extrase. Deoarece datele pot proveni din tipuri diferite
de contoare, worker-ul aplică o normalizare a câmpurilor de consum.
Astfel, valori precum `consumption`, `energy`, `consumption_total`,
`energy_kwh` sau `thermal_energy_kwh` sunt tratate ca surse posibile
pentru câmpul canonic de consum.

<figure id="fig:secventa-procesare-mqtt" data-latex-placement="htbp">

<figcaption>Secvența de procesare a unui mesaj uplink</figcaption>
</figure>

După normalizare, worker-ul construiește un punct InfluxDB cu
măsurătoarea `meter_reading`. Identificatorul `devEui` este salvat ca
tag, iar valorile precum consumul, tensiunea sau curentul sunt salvate
ca field-uri numerice. Dacă un mesaj nu conține nicio valoare numerică
relevantă, acesta este ignorat pentru a evita introducerea de date
nevalide în seria de timp.

Această proiectare oferă două avantaje importante. În primul rând,
aplicația web nu depinde direct de structura internă a mesajelor
ChirpStack, deoarece worker-ul realizează etapa de adaptare. În al
doilea rând, baza de date InfluxDB primește date într-un format uniform,
ceea ce simplifică interogările ulterioare pentru grafice, costuri și
predicții.

## Modelul de date al aplicației

Modelul de date este împărțit între o bază de date relațională și o bază
de date time-series. Această separare reflectă diferența dintre
metadatele aplicației și telemetria generată de dispozitive. Metadatele
au relații clare și se modifică relativ rar, în timp ce telemetria este
generată periodic și este interogată frecvent pe intervale temporale.

### Modelul relațional PostgreSQL

PostgreSQL este utilizat pentru stocarea entităților principale ale
aplicației. Modelul relațional este definit prin Prisma și include două
entități centrale: `User` și `Device`. Entitatea `User` conține
informații precum adresa de email, hash-ul parolei, numele, rolul și
tipul clientului. Rolurile definite sunt `ADMIN` și `CUSTOMER`, iar
pentru clienți se disting tipurile `INDIVIDUAL` și `COMPANY`.

Entitatea `Device` descrie fiecare contor gestionat de aplicație. Câmpul
`devEui` reprezintă cheia de legătură între ChirpStack, fluxul MQTT,
InfluxDB și dashboard. În plus, dispozitivul conține numele, tipul
utilității, tariful pe unitate, unitatea de măsură, starea activă,
coordonatele geografice și metadatele necesare revendicării prin cod.

<figure id="fig:diagrama-postgresql" data-latex-placement="htbp">

<figcaption>Diagrama logică a modelului relațional
PostgreSQL</figcaption>
</figure>

Relația dintre utilizatori și dispozitive este de tip unu-la-mai-mulți.
Un utilizator poate deține mai multe dispozitive, iar un dispozitiv
poate fi asociat unui singur utilizator la un moment dat. În cazul în
care un dispozitiv nu a fost revendicat, câmpul `userId` poate fi nul,
permițând pregătirea inventarului înainte de asocierea cu un client.

### Modelul time-series InfluxDB

InfluxDB este utilizat pentru stocarea citirilor istorice. Măsurătoarea
principală este `meter_reading`, iar identificatorul dispozitivului este
păstrat ca tag prin câmpul `devEui`. Valorile numerice, precum consumul,
tensiunea sau curentul, sunt salvate ca field-uri. Această structură
este potrivită pentru interogări pe intervale de timp, agregări și
extragerea seriilor istorice necesare predicției.

<figure id="fig:model-influxdb" data-latex-placement="htbp">

<figcaption>Structura logică a datelor time-series din
InfluxDB</figcaption>
</figure>

Prin această separare, PostgreSQL rămâne responsabil pentru consistența
relațională, iar InfluxDB este optimizat pentru volumul mare de citiri
istorice. Aplicația web combină cele două surse de date la nivelul
endpoint-urilor API.

## Mecanismul de asociere a dispozitivelor cu utilizatorii

Asocierea dispozitivelor cu utilizatorii este realizată printr-un
mecanism de revendicare bazat pe coduri. Această soluție a fost
introdusă pentru a evita asocierea manuală a dispozitivelor direct din
baza de date sau din interfața ChirpStack. În schimb, dispozitivele pot
exista inițial ca resurse neasociate, având salvat un cod de revendicare
sub formă de hash.

Utilizatorul introduce codul de revendicare în momentul înregistrării
sau ulterior, din interfața aplicației. Aplicația normalizează codul
introdus, calculează hash-ul corespunzător și caută dispozitivele care
au același `claimCodeHash`. Dacă tipul clientului corespunde restricției
dispozitivului, iar dispozitivul nu a fost revendicat de alt cont,
acesta este asociat utilizatorului curent.

Diferențierea dintre conturile de companie și utilizatorii individuali
este realizată prin câmpul `customerType`. Astfel, un cod destinat unei
companii nu poate fi utilizat pentru un cont individual și invers.
Această regulă este importantă deoarece o companie poate deține un set
mai mare de contoare, în timp ce un utilizator individual are acces doar
la dispozitivele proprii.

Din punct de vedere al securității, aplicația nu stochează codul de
revendicare în clar ca mecanism principal de validare, ci utilizează
hash-uri. Această abordare reduce riscul expunerii directe a codurilor
și permite verificarea fără păstrarea valorii originale în baza de date
aplicativă.

Fluxul logic al mecanismului de revendicare este sintetizat în Figura
[5.6](#fig:flux-revendicare-dispozitive){reference-type="ref"
reference="fig:flux-revendicare-dispozitive"}. Acesta evidențiază faptul
că asocierea nu se face direct pe baza codului introdus de utilizator,
ci printr-o comparație între hash-ul calculat și metadatele persistate
pentru dispozitive.

<figure id="fig:flux-revendicare-dispozitive"
data-latex-placement="htbp">

<figcaption>Fluxul de revendicare și asociere a dispozitivelor cu
utilizatorii</figcaption>
</figure>

## API-ul aplicației web

Stratul API este implementat în Next.js și are rolul de a expune
funcționalitățile aplicației către interfața web. Endpoint-urile
validează datele primite, verifică autentificarea utilizatorului și
aplică regulile de ownership înainte de accesarea resurselor.

::: {#tab:endpointuri-api}
  **Endpoint**                               **Rol funcțional**
  ------------------------------------------ -------------------------------------------------------------------------------------
  `POST /api/auth/register`                  Înregistrarea unui utilizator și, opțional, revendicarea dispozitivelor prin cod.
  `POST /api/auth/login`                     Autentificarea utilizatorului și emiterea sesiunii.
  `GET /api/auth/me`                         Obținerea utilizatorului autentificat.
  `POST /api/auth/logout`                    Închiderea sesiunii curente.
  `GET /api/devices`                         Listarea dispozitivelor asociate contului curent.
  `POST /api/devices`                        Crearea unui dispozitiv din aplicație.
  `POST /api/devices/claim`                  Asocierea dispozitivelor cu utilizatorul prin cod de revendicare.
  `GET/PATCH/DELETE /api/devices/[devEui]`   Citirea, actualizarea sau ștergerea unui dispozitiv, cu verificarea proprietarului.
  `GET /api/devices/[devEui]/readings`       Citirea datelor istorice din InfluxDB.
  `GET /api/devices/[devEui]/cost`           Calculul costului estimat pentru un dispozitiv.
  `GET /api/devices/[devEui]/forecast`       Obținerea predicției ARIMA pentru un dispozitiv.
  `GET /api/devices/summary`                 Construirea sumarului de flotă pentru dashboard.
  `GET /api/devices/stream`                  Furnizarea actualizărilor live prin Server-Sent Events.

  : Endpoint-uri API principale
:::

Un aspect important al implementării API-ului este verificarea accesului
la dispozitive. Înainte de returnarea citirilor, costurilor sau
predicțiilor, aplicația verifică dacă dispozitivul identificat prin
`devEui` aparține utilizatorului autentificat. Această regulă previne
accesul neautorizat la telemetria altui cont.

## Interfața web și dashboard-ul operațional

Interfața web este implementată utilizând Next.js și React. Dashboard-ul
are rolul de a transforma datele tehnice ale sistemului în informații
ușor de interpretat de către utilizator. Din punct de vedere vizual,
aplicația folosește o interfață operațională de tip dashboard, cu
navigare laterală, pagini specializate și grafice pentru consumuri,
costuri și predicții.

### Autentificarea și selecția limbii

Fluxul de autentificare permite utilizatorului să se conecteze cu adresa
de email și parola asociată contului. Parolele nu sunt stocate în clar,
ci sub formă de hash. Aplicația include și posibilitatea de selecție a
limbii, astfel încât interfața să poată fi utilizată atât în limba
engleză, cât și în limba română.

### Pagina de prezentare generală

Pagina de prezentare generală oferă o imagine agregată asupra flotei de
dispozitive. Aceasta include indicatori privind numărul total de
dispozitive, categoriile de utilități, costul estimat și starea generală
a sistemului. Graficele prezintă consumul agregat pe utilități și
distribuția costurilor, iar secțiunea live afișează ultimele valori
disponibile.

### Pagina de administrare a dispozitivelor

Pagina de dispozitive permite utilizatorului să vizualizeze inventarul
contoarelor, să filtreze dispozitivele și să acceseze operații de
editare. Pentru un număr mai mare de dispozitive, interfața utilizează o
organizare paginată, evitând încărcarea vizuală excesivă. În plus,
utilizatorul poate revendica dispozitive prin cod sau poate adăuga
manual un dispozitiv, în funcție de scenariul de utilizare.

### Pagina contorului individual

Pagina contorului individual prezintă detaliile unui dispozitiv
selectat. Aceasta include valorile live, profilul de consum, costurile
estimate și prognoza ARIMA. Utilizatorul poate schimba dispozitivul
analizat fără a reveni la inventar, ceea ce facilitează compararea
contoarelor.

### Pagina de facturare

Pagina de facturare are rolul de a centraliza costurile estimate.
Aceasta prezintă costuri pe utilități, dispozitive cu consum ridicat și
estimări agregate. Deși aplicația nu generează facturi reale, modulul
oferă o imagine operațională asupra costurilor posibile pe baza
consumurilor și tarifelor definite.

### Vizualizarea pe hartă

Modul de hartă afișează contoarele pe baza coordonatelor geografice
salvate în baza de date. Această vizualizare este utilă în special
pentru conturile de companie, deoarece permite localizarea rapidă a
dispozitivelor și analizarea distribuției geografice a flotei.

## Calculul consumului și al costurilor

Calculul costurilor se bazează pe diferența de consum într-un interval
de timp și pe tariful unitar asociat dispozitivului. Pentru un
dispozitiv dat, aplicația extrage din InfluxDB valorile relevante ale
consumului și determină variația acestora în perioada analizată. Costul
estimat este apoi calculat prin relația:

$$\begin{equation}
C_{cost} = \Delta C_{consum} \cdot T_{unitar}
\label{eq:calcul-cost}
\end{equation}$$

unde $\Delta C_{consum}$ reprezintă diferența de consum pe intervalul
analizat, iar $T_{unitar}$ reprezintă tariful pe unitate definit pentru
dispozitiv.

Figura [5.7](#fig:flux-calcul-costuri){reference-type="ref"
reference="fig:flux-calcul-costuri"} prezintă fluxul funcțional al
acestui calcul, evidențiind faptul că estimarea costului combină date
provenite din cele două mecanisme de persistență: consumul istoric din
InfluxDB și tariful asociat dispozitivului din PostgreSQL.

<figure id="fig:flux-calcul-costuri" data-latex-placement="htbp">

<figcaption>Fluxul de calcul al costurilor estimate</figcaption>
</figure>

Costurile pot fi calculate la nivel de dispozitiv, dar și agregate la
nivel de utilitate sau flotă. Această agregare permite utilizatorului să
observe care categorie de contoare contribuie cel mai mult la costul
total. În cazul companiei, această funcționalitate este relevantă
deoarece numărul de contoare este mai mare, iar analiza individuală a
fiecărui dispozitiv ar fi mai dificilă.

Trebuie menționat că valorile calculate reprezintă estimări
operaționale, nu facturi oficiale. Tarifele sunt definite în aplicație,
iar datele provin din simulator sau din seria de timp stocată local.
Totuși, modelul este extensibil și poate fi adaptat ulterior pentru
tarife reale sau reguli de facturare mai complexe.

::: {#tab:tipuri-dispozitive}
  **Tip utilitate**   **Unitate**   **Observație**
  ------------------- ------------- ----------------------------------
  Electricitate       kWh           Consum energetic electric.
  Gaz                 m$^3$         Consum volumetric de gaz.
  Apă                 m$^3$         Consum volumetric de apă.
  Încălzire           kWh           Energie termică estimată.
  Răcire              kWh           Energie utilizată pentru răcire.

  : Tipuri de dispozitive și unități de măsură
:::

## Modulul de predicție ARIMA

Modulul de predicție reprezintă extensia analitică a sistemului. Acesta
este implementat ca serviciu separat, utilizând Python, FastAPI și
biblioteca `statsmodels`. Separarea într-un serviciu independent este
justificată de faptul că ecosistemul Python oferă biblioteci mature
pentru analiza seriilor temporale, în timp ce aplicația principală
rămâne concentrată pe autentificare, API-uri și interfață web.

Fluxul de predicție pornește din aplicația Next.js. Pentru un dispozitiv
selectat, API-ul extrage din InfluxDB seria istorică de consum, agregată
pe un interval configurabil. Datele trimise către serviciul Python
conțin doar perechi de tip timestamp-valoare, fără credențiale de acces
la bazele de date. Această separare reduce cuplarea dintre serviciul de
predicție și infrastructura de stocare.

<figure id="fig:flux-arima" data-latex-placement="htbp">

<figcaption>Fluxul modulului de predicție ARIMA</figcaption>
</figure>

Serviciul de predicție expune endpoint-ul `POST /forecast`. Acesta
primește seria istorică, orizontul de predicție și pasul temporal. Dacă
numărul de puncte valide este insuficient, serviciul returnează starea
`insufficient_data`. În caz contrar, sunt testate combinații limitate de
parametri ARIMA $(p,d,q)$, iar modelul cu cel mai bun criteriu AIC este
selectat pentru generarea predicției.

Rezultatul conține valorile prognozate, ordinul ARIMA selectat, metadate
despre model și, atunci când sunt disponibile, limite de încredere. În
interfață, predicția este afișată în pagina contorului individual,
alături de valorile observate. Această integrare evidențiază trecerea de
la monitorizarea pasivă la analiza predictivă.

## Module software importante

Aplicația este implementată printr-un set de module software cu
responsabilități distincte. Deoarece proiectul folosește TypeScript,
React și Python, structura nu este bazată exclusiv pe clase în sensul
tradițional al programării orientate pe obiecte. Din acest motiv, o
diagramă de module este mai relevantă decât o diagramă clasică de clase.

<figure id="fig:module-software" data-latex-placement="htbp">

<figcaption>Diagrama modulelor software principale</figcaption>
</figure>

::: {#tab:module-software}
  **Modul**              **Responsabilitate**
  ---------------------- -------------------------------------------------------------------------------------------
  `mqtt-worker`          Procesează mesajele ChirpStack și scrie telemetria în InfluxDB.
  `device.service`       Gestionează listarea, crearea, actualizarea și verificarea ownership-ului dispozitivelor.
  `influx.service`       Execută interogări InfluxDB pentru citiri, agregări, consum și date de antrenare.
  `billing.service`      Calculează costurile estimate pe baza consumului și a tarifelor.
  `forecast.service`     Trimite date agregate către serviciul ARIMA și normalizează răspunsul primit.
  `claim-code.service`   Validează codurile de revendicare și asociază dispozitivele cu utilizatorii.
  `Dashboard`            Afișează grafice, tabele, hărți, valori live și predicții.
  `forecast-service`     Serviciu Python care selectează modelul ARIMA și generează prognoza.

  : Module software importante și responsabilitățile acestora
:::

Tabelul [5.5](#tab:tehnologii){reference-type="ref"
reference="tab:tehnologii"} sintetizează tehnologiile principale
utilizate în implementare.

::: {#tab:tehnologii}
  **Tehnologie**           **Rol în proiect**
  ------------------------ ---------------------------------------------------------------
  Next.js și React         Implementarea aplicației web și a dashboard-ului operațional.
  TypeScript               Dezvoltarea sigură a logicii aplicației și a API-urilor.
  Prisma și PostgreSQL     Modelarea și stocarea datelor relaționale.
  InfluxDB                 Stocarea și interogarea seriilor temporale de consum.
  MQTT și Mosquitto        Transportul asincron al mesajelor de telemetrie.
  ChirpStack               Server de rețea LoRaWAN pentru gestionarea dispozitivelor.
  FastAPI și statsmodels   Implementarea serviciului de predicție ARIMA.
  Docker Compose           Orchestrarea serviciilor necesare mediului local.
  Recharts și Leaflet      Vizualizarea graficelor și a dispozitivelor pe hartă.

  : Tehnologii utilizate în implementare
:::

## Considerații privind securitatea și controlul accesului

Securitatea aplicației este abordată la nivelul autentificării,
autorizării și protejării codurilor de revendicare. Parolele
utilizatorilor sunt stocate sub formă de hash, iar accesul la
endpoint-urile protejate se realizează pe baza sesiunii utilizatorului
autentificat.

Controlul accesului la dispozitive este realizat prin verificarea
relației dintre utilizator și dispozitiv. Pentru operații precum citirea
telemetriei, calculul costului sau obținerea predicției, aplicația
validează că dispozitivul identificat prin `devEui` aparține
utilizatorului curent. Astfel, un utilizator nu poate accesa datele unui
dispozitiv asociat altui cont.

Mecanismul de revendicare contribuie, de asemenea, la securitate.
Codurile sunt normalizate și transformate în hash, iar aplicația
verifică atât existența codului, cât și compatibilitatea cu tipul
contului. În acest mod, un cod destinat unei companii nu poate fi
folosit pentru un utilizator individual.

## Considerații privind scalabilitatea și mentenanța

Sistemul a fost proiectat modular pentru a permite extinderea
ulterioară. Utilizarea Docker Compose simplifică pornirea serviciilor
locale și oferă o structură clară a dependențelor. Brokerul MQTT
decuplează serverul de rețea de worker-ul aplicației, iar folosirea
InfluxDB permite gestionarea unui volum mai mare de citiri istorice
decât o bază de date relațională tradițională.

Un alt avantaj al arhitecturii este posibilitatea de a adăuga noi tipuri
de dispozitive. Deoarece tipul utilității, unitatea de măsură și tariful
sunt modelate explicit, extinderea către alte categorii de contoare
poate fi realizată prin completarea modelului existent. De asemenea,
simulatorul poate fi înlocuit cu dispozitive reale, atât timp cât
acestea sunt integrate în ChirpStack și generează evenimente MQTT
compatibile.

Limitările principale ale implementării curente sunt legate de
caracterul demonstrativ al mediului. Datele provin din simulator,
tarifele sunt statice, iar predicția este calculată la cerere. Cu toate
acestea, aceste alegeri sunt adecvate pentru scopul lucrării, deoarece
permit validarea unei arhitecturi complete fără introducerea unei
complexități operaționale excesive.

Topologia mediului local este prezentată în Figura
[5.10](#fig:topologie-docker-compose){reference-type="ref"
reference="fig:topologie-docker-compose"}. Figura diferențiază
serviciile rulate prin Docker Compose de procesele aplicației pornite
local, cum sunt serverul Next.js și worker-ul MQTT.

<figure id="fig:topologie-docker-compose" data-latex-placement="htbp">

<figcaption>Topologia mediului local de rulare și a serviciilor Docker
Compose</figcaption>
</figure>

## Concluzii privind implementarea

Capitolul a prezentat proiectarea și implementarea sistemului integrat
de monitorizare și gestiune a consumului de utilități prin rețele
LoRaWAN. Soluția dezvoltată acoperă întregul flux al datelor, de la
generarea traficului LoRaWAN simulat până la afișarea consumului,
costurilor și predicțiilor în interfața web.

Arhitectura propusă este modulară și separă clar responsabilitățile
componentelor. ChirpStack gestionează partea LoRaWAN, MQTT asigură
comunicarea asincronă, worker-ul realizează procesarea telemetriei,
InfluxDB stochează seriile de timp, PostgreSQL gestionează metadatele,
iar aplicația Next.js oferă interfața și API-ul sistemului. Modulul
ARIMA completează funcționalitatea prin introducerea unei componente
predictive.

Prin această implementare, proiectul demonstrează integrarea mai multor
tehnologii relevante pentru domeniul IoT și al sistemelor distribuite.
Capitolul următor va prezenta testarea și validarea sistemului, cu
accent pe verificarea funcțională a fluxului de date, a interfeței și a
modulelor implementate.

# Testare și validare

## Strategia de testare

Scopul acestui capitol este de a demonstra că sistemul implementat
îndeplinește cerințele funcționale și tehnice definite anterior.
Validarea nu se limitează la observarea interfeței grafice, ci urmărește
verificarea controlată a componentelor software, a interfețelor API, a
fluxului de date IoT și a modulului predictiv bazat pe ARIMA.

Strategia de testare utilizată este structurată pe mai multe niveluri.
La baza acesteia se află verificările statice și testele unitare, care
au rolul de a identifica erori de implementare în module izolate.
Nivelul intermediar este reprezentat de testele de integrare, prin care
sunt validate comunicația dintre API, bazele de date și serviciul de
predicție. Nivelul superior este reprezentat de testele end-to-end și de
validarea manuală asistată, unde este verificat fluxul complet de la
simulatorul LoRaWAN până la dashboard-ul aplicației.

Această abordare este adecvată pentru proiect deoarece sistemul este
compus din servicii eterogene: aplicație web Next.js, worker MQTT, baze
de date PostgreSQL și InfluxDB, infrastructură ChirpStack, simulator
LoRaWAN și serviciu Python pentru predicție. Prin urmare, o singură
metodă de testare nu ar fi suficientă pentru a valida corect întregul
sistem.

::: {#tab:strategie-testare}
  **Nivel de testare**   **Scop**                                                     **Instrumente utilizate**
  ---------------------- ------------------------------------------------------------ --------------------------------------------
  Verificări statice     Identificarea erorilor de sintaxă, tipare și build           ESLint, TypeScript, Next.js build
  Teste unitare          Verificarea funcțiilor izolate                               Vitest, pytest
  Teste de integrare     Validarea API-urilor și a comunicației dintre servicii       Playwright API, Docker Compose
  Teste end-to-end       Validarea fluxurilor reale de utilizare                      Playwright, browser, date demo
  Validare IoT           Verificarea traseului simulator--MQTT--InfluxDB--dashboard   Docker logs, InfluxDB, dashboard
  Validare predictivă    Verificarea comportamentului ARIMA                           pytest, endpoint forecast, dashboard Meter

  : Strategia generală de testare
:::

## Mediul de testare

Testarea este realizată într-un mediu local, orchestrat prin Docker
Compose. Acest mediu reproduce componentele necesare pentru demonstrarea
funcțională a sistemului fără a necesita contoare fizice sau gateway-uri
LoRaWAN reale. Aplicația web și worker-ul MQTT sunt pornite local din
directorul `web-app`, iar serviciile de infrastructură sunt pornite din
directorul rădăcină al proiectului.

::: {#tab:mediu-testare}
  **Componentă**     **Rol în procesul de testare**
  ------------------ -------------------------------------------------------------------------------------------------------------------------------------------
  Docker Compose     Pornește serviciile necesare: PostgreSQL, InfluxDB, Redis, Mosquitto, ChirpStack, Gateway Bridge, simulatorul LoRaWAN și serviciul ARIMA.
  PostgreSQL         Stochează utilizatorii, dispozitivele, tarifele și relațiile de ownership.
  InfluxDB           Stochează telemetria istorică și datele utilizate pentru grafice și predicții.
  ChirpStack         Gestionează dispozitivele LoRaWAN simulate și publică evenimentele uplink.
  Mosquitto MQTT     Permite transmiterea asincronă a mesajelor de telemetrie către worker.
  LWN Simulator      Generează trafic LoRaWAN simulat pentru contoare de electricitate, gaz, apă, încălzire și răcire.
  Next.js Web App    Expune API-urile și interfața dashboard-ului.
  Forecast Service   Generează predicții pe termen scurt folosind modelul ARIMA.

  : Componentele mediului local de testare
:::

Pregătirea mediului se realizează prin următoarele comenzi:

    docker compose up -d
    cd web-app
    npm run provision:demo-devices
    npm run seed:history
    npm run dev:all

Aceste comenzi pornesc infrastructura locală, creează dispozitivele
demonstrative, generează date istorice și rulează simultan aplicația web
și worker-ul MQTT.

## Testarea componentelor software

Testarea componentelor software urmărește verificarea modulelor care pot
fi validate izolat, fără dependență directă de bazele de date sau de
infrastructura LoRaWAN. Pentru aplicația web au fost introduse teste
unitare cu Vitest, iar pentru serviciul de predicție sunt utilizate
teste Python cu pytest.

### Verificări statice și de build

Pentru aplicația Next.js sunt utilizate trei verificări principale:

    npm run lint
    npx tsc --noEmit
    npm run build

Comanda `npm run lint` validează respectarea regulilor ESLint. Comanda
`npx tsc --noEmit` verifică tipurile TypeScript fără a genera fișiere de
ieșire. Comanda `npm run build` validează faptul că aplicația poate fi
compilată în mod de producție.

### Teste unitare pentru aplicația web

Testele unitare acoperă funcții de normalizare, validare și formatare.
Acestea sunt importante deoarece erorile în astfel de funcții pot afecta
mai multe zone ale aplicației: API-uri, formulare, grafice și calcule de
cost.

::: {#tab:teste-unitare-web}
  **Funcționalitate testată**   **Criteriu de acceptare**                                                       **Instrument**
  ----------------------------- ------------------------------------------------------------------------------- ----------------
  Tipuri de utilități           Sunt acceptate doar tipurile cunoscute, iar unitățile implicite sunt corecte.   Vitest
  Coduri de revendicare         Codurile sunt normalizate și validate înainte de utilizare.                     Vitest
  Identificator `devEui`        Formatul este normalizat la 16 caractere hexazecimale.                          Vitest
  Interogări telemetry          Intervalele de timp invalide și parametrii incompatibili sunt respinși.         Vitest
  Formatare dashboard           Valorile monetare, cantitățile și statusurile sunt afișate defensiv.            Vitest

  : Teste unitare pentru aplicația web
:::

Rularea testelor unitare se face prin:

    cd web-app
    npm run test

### Teste unitare pentru serviciul ARIMA

Serviciul de predicție este testat cu pytest. Testele verifică atât
cazul normal, în care există suficiente date istorice, cât și cazurile
de fallback sau input invalid. Această verificare este importantă
deoarece modulul ARIMA trebuie să se comporte predictibil și atunci când
datele sunt insuficiente.

::: {#tab:teste-unitare-arima}
  **Scenariu**              **Rezultat așteptat**                                      **Instrument**
  ------------------------- ---------------------------------------------------------- ----------------
  Serie istorică scurtă     Răspuns cu status `insufficient_data`.                     pytest
  Serie istorică regulată   Sunt generate puncte de predicție.                         pytest
  Parametri invalizi        Serviciul returnează eroare de validare.                   pytest
  Orizont parțial           Numărul de pași este calculat prin rotunjire superioară.   pytest
  Selecție ordin ARIMA      Ordinul selectat rămâne în grila configurată.              pytest

  : Teste unitare pentru serviciul ARIMA
:::

Rularea testelor se face prin:

    cd forecast-service
    python -m pytest

## Testarea API-ului aplicației

Testarea API-ului urmărește validarea contractelor expuse de aplicația
Next.js. Sunt verificate atât cazuri de succes, cât și cazuri de acces
neautorizat. Pentru aceste teste este necesar ca aplicația să fie
pornită local și baza de date să conțină utilizatorii și dispozitivele
demonstrative.

::: {#tab:teste-api}
  **Endpoint**                           **Scopul testului**                          **Rezultat așteptat**
  -------------------------------------- -------------------------------------------- ---------------------------------------------------------------------------------------
  `POST /api/auth/login`                 Autentificarea contului demo de companie.    Status 200 și sesiune validă.
  `GET /api/auth/me`                     Verificarea utilizatorului autentificat.     Email-ul corespunde contului demo.
  `GET /api/devices`                     Listarea dispozitivelor asociate contului.   Lista conține dispozitive.
  `GET /api/devices/summary`             Obținerea sumarului de flotă.                Totalul de dispozitive este pozitiv.
  `GET /api/devices/[devEui]/readings`   Citirea telemetriei pentru un dispozitiv.    Răspuns valid pentru dispozitivul selectat.
  `GET /api/devices/[devEui]/cost`       Calculul costului estimat.                   Cost numeric mai mare sau egal cu zero.
  `GET /api/devices/[devEui]/forecast`   Obținerea predicției ARIMA.                  Status controlat: `ok`, `insufficient_data`, `model_error` sau `service_unavailable`.
  Endpoint protejat fără sesiune         Verificarea autentificării obligatorii.      Status 401.
  Dispozitiv al altui utilizator         Verificarea izolării ownership-ului.         Acces interzis sau dispozitiv ascuns.

  : Scenarii de testare pentru API
:::

Rularea testelor API se face prin:

    cd web-app
    npm run test:e2e -- --project=api

## Testarea fluxului IoT

Validarea fluxului IoT este esențială deoarece sistemul nu este doar o
aplicație web, ci o platformă care integrează o infrastructură LoRaWAN
simulată. Fluxul verificat este:

    LWN Simulator -> ChirpStack Gateway Bridge -> ChirpStack -> Mosquitto MQTT
    -> MQTT Worker -> InfluxDB -> Next.js API -> Dashboard

Pentru validare se verifică succesiv fiecare punct al traseului. Mai
întâi se confirmă că serviciile Docker sunt pornite. Apoi se verifică
existența dispozitivelor în ChirpStack și publicarea mesajelor uplink
prin MQTT. În continuare, se verifică logurile worker-ului și existența
măsurătorii `meter_reading` în InfluxDB. La final, se verifică afișarea
datelor în dashboard.

::: {#tab:teste-flux-iot}
  **Punct verificat**      **Metodă de verificare**                            **Criteriu de acceptare**
  ------------------------ --------------------------------------------------- -----------------------------------------
  Containere Docker        `docker compose ps`                                 Serviciile sunt în stare running.
  Dispozitive ChirpStack   Interfața ChirpStack sau scriptul de provisioning   Dispozitivele demo există.
  Mesaje MQTT              Loguri Mosquitto/worker                             Mesaje uplink recepționate.
  Persistență InfluxDB     Interogare pentru `meter_reading`                   Există puncte pentru `devEui`.
  Dashboard                Interfața Overview/Meter                            Valorile live și istorice sunt afișate.

  : Scenarii de validare a fluxului IoT
:::

Figurile [6.1](#fig:testare-worker-mqtt){reference-type="ref"
reference="fig:testare-worker-mqtt"} și
[6.2](#fig:testare-influxdb){reference-type="ref"
reference="fig:testare-influxdb"} prezintă două dovezi complementare
pentru traseul de date. Prima evidențiază conectarea worker-ului la
brokerul MQTT, abonarea la topicul de uplink și apelurile API realizate
de dashboard. A doua confirmă existența citirilor `meter_reading` în
InfluxDB.

<figure id="fig:testare-worker-mqtt" data-latex-placement="h!">
<img src="./imagini/11_mqtt_worker_logs.png"
style="width:90.0%;height:78.0%" />
<figcaption>Fragment de log pentru worker-ul MQTT și apelurile API ale
dashboard-ului</figcaption>
</figure>

<figure id="fig:testare-influxdb" data-latex-placement="h!">
<img src="./imagini/12_influx_meter_reading.png"
style="width:90.0%;height:78.0%" />
<figcaption>Interogare InfluxDB pentru măsurătoarea
<code>meter_reading</code></figcaption>
</figure>

## Testarea interfeței web

Interfața web este validată prin teste Playwright și prin inspecție
vizuală. Testele automate verifică autentificarea și accesarea rutelor
principale. Inspecția vizuală este necesară deoarece dashboard-ul
conține grafice, hărți și tabele a căror lizibilitate trebuie verificată
în contexte diferite.

::: {#tab:teste-ui}
  **Zonă UI**     **Scenariu validat**                                 **Criteriu de acceptare**
  --------------- ---------------------------------------------------- -----------------------------------------------------------
  Autentificare   Login cu contul demo de companie.                    Utilizatorul ajunge în dashboard.
  Overview        Afișarea KPI-urilor, graficelor și sumarului live.   Datele sunt vizibile și coerente.
  Devices         Paginare, filtrare, claim panel și edit modal.       Lista este utilizabilă pentru flotă mare.
  Meter           Selectare dispozitiv, profil consum și forecast.     Citirile și predicția sunt afișate fără blocarea paginii.
  Billing         Costuri pe utilități și top dispozitive.             Costurile sunt afișate agregat și pe dispozitiv.
  Map             Poziționare geografică și selecție dispozitiv.       Marcatorii sunt vizibili și selectabili.
  Mobile          Viewport `390x844`.                                  Nu există clipping orizontal.

  : Scenarii de testare a interfeței web
:::

## Validarea modulului ARIMA

Validarea modulului ARIMA are două obiective. Primul obiectiv este
verificarea funcționării serviciului Python independent. Al doilea
obiectiv este verificarea integrării acestuia cu aplicația Next.js și cu
interfața Meter.

Serviciul Python primește puncte istorice sub forma unor perechi
timestamp-valoare. Dacă numărul de puncte valide este mai mic decât
pragul minim, serviciul returnează `insufficient_data`. Dacă există
suficiente puncte, serviciul selectează ordinul ARIMA prin criteriul AIC
și generează predicțiile pentru orizontul cerut.

::: {#tab:validare-arima}
  **Caz validat**                  **Rezultat așteptat**                             **Nivel**
  -------------------------------- ------------------------------------------------- ----------------
  Serie istorică suficientă        Predicție cu status `ok`.                         Serviciu + API
  Serie istorică insuficientă      Răspuns controlat `insufficient_data`.            Serviciu + UI
  Serviciu forecast indisponibil   Meter afișează mesaj neblocant.                   API + UI
  Cost estimat forecast            Costul este calculat cu tariful dispozitivului.   API

  : Scenarii de validare pentru modulul ARIMA
:::

Un răspuns valid al endpoint-ului de forecast conține statusul
modelului, ordinul ARIMA selectat, punctele prognozate și estimarea de
cost. Aceste elemente permit atât validarea tehnică a serviciului, cât
și integrarea rezultatelor în dashboard.

Disponibilitatea serviciului predictiv a fost verificată prin
endpoint-ul de sănătate. Figura
[6.3](#fig:testare-meter-forecast){reference-type="ref"
reference="fig:testare-meter-forecast"} arată integrarea rezultatului în
pagina contorului individual.

<figure id="fig:testare-meter-forecast" data-latex-placement="htbp">
<img src="./imagini/testare-meter-forecast.png" style="width:90.0%" />
<figcaption>ARIMA Forecast</figcaption>
</figure>

## Rezultatele testării

Rezultatele testării sunt centralizate în Tabelul
[6.9](#tab:rezultate-testare){reference-type="ref"
reference="tab:rezultate-testare"}. Testele au fost rulate pe mediul
local descris anterior, cu serviciile Docker pornite, date demonstrative
provisionate și date istorice încărcate în InfluxDB.

::: {#tab:rezultate-testare}
  **Categorie test**        **Status**   **Observații**
  ------------------------- ------------ ------------------------------------------------------------------------------------------------------------------------------------------------
  Lint și TypeScript        Trecut       `npm run lint` și `npx tsc --noEmit` au rulat fără erori.
  Build Next.js             Trecut       `npm run build` a compilat aplicația și rutele Next.js.
  Teste unitare web-app     Trecut       Vitest a raportat 14 teste trecute.
  Teste forecast-service    Trecut       Pytest a raportat 6 teste trecute pentru serviciul ARIMA.
  Teste API                 Trecut       Playwright API a raportat 3 teste trecute, inclusiv acces neautorizat și ownership.
  Teste UI desktop/mobile   Trecut       Proiectul desktop a raportat 1 test trecut și 1 test sărit intenționat; proiectul mobile a raportat 1 test trecut și 1 test sărit intenționat.
  Flux IoT end-to-end       Trecut       Serviciile Docker au fost active, worker-ul MQTT s-a conectat la broker, iar InfluxDB a returnat citiri `meter_reading`.

  : Centralizarea rezultatelor testării
:::

Dovezile de rulare pentru testele automate sunt prezentate în Figurile
[6.4](#fig:testare-unitare){reference-type="ref"
reference="fig:testare-unitare"} și
[6.5](#fig:testare-api){reference-type="ref"
reference="fig:testare-api"}. Acestea sunt incluse pentru trasabilitatea
rezultatelor, în timp ce interpretarea finală este sintetizată în
Tabelul [6.9](#tab:rezultate-testare){reference-type="ref"
reference="tab:rezultate-testare"}.

<figure id="fig:testare-unitare" data-latex-placement="htbp">
<img src="./imagini/10_vitest_pytest_results.png"
style="width:95.0%;height:75.0%" />
<figcaption>Rezultatele testelor unitare pentru aplicația web și
serviciul ARIMA</figcaption>
</figure>

<figure id="fig:testare-api" data-latex-placement="htbp">
<img src="./imagini/09_playwright_api_results.png"
style="width:95.0%;height:75.0%" />
<figcaption>Rezultatele testelor de integrare API</figcaption>
</figure>

## Limitări ale procesului de testare

Procesul de testare are câteva limitări. În primul rând, dispozitivele
sunt simulate, nu fizice. Această alegere permite reproducerea mediului
local, dar nu validează propagarea radio reală, interferențele sau
comportamentul hardware. În al doilea rând, tarifele sunt statice și au
rol demonstrativ, deci validarea costurilor nu reprezintă o verificare
de facturare comercială. În al treilea rând, testarea de performanță
este limitată la dimensiunea flotei demonstrative și nu acoperă scenarii
cu mii de dispozitive.

Cu toate acestea, limitările sunt acceptabile pentru scopul lucrării,
deoarece obiectivul principal este validarea unei arhitecturi software
funcționale și extensibile. Sistemul demonstrează integrarea completă
între simulare LoRaWAN, procesare MQTT, stocare time-series, dashboard
operațional și predicție de consum.

## Concluzii privind validarea

Capitolul a prezentat strategia de testare și validare a sistemului.
Metodele propuse acoperă atât componentele izolate, cât și integrarea
completă a platformei. Testele statice și unitare oferă încredere în
corectitudinea modulelor software, testele API validează contractele
aplicației, iar testele end-to-end demonstrează funcționarea scenariilor
reale de utilizare.

Validarea fluxului IoT confirmă faptul că datele generate de simulator
pot fi transmise prin ChirpStack și MQTT, procesate de worker, stocate
în InfluxDB și afișate în dashboard. Validarea modulului ARIMA confirmă
faptul că aplicația depășește nivelul de monitorizare pasivă și include
o componentă de analiză predictivă.

Prin această strategie, sistemul este verificat din punct de vedere
funcțional, arhitectural și operațional, iar rezultatele obținute pot fi
utilizate ca suport experimental pentru concluziile lucrării.

# Manual de instalare și utilizare

## Scopul manualului

Acest capitol prezintă pașii necesari pentru instalarea, pornirea și
utilizarea aplicației dezvoltate. Manualul este orientat către rularea
locală a sistemului, în scop demonstrativ și experimental. Prin urmare,
sunt descrise resursele necesare, comenzile de pornire, inițializarea
datelor demonstrative și principalele interacțiuni disponibile în
interfața web.

## Cerințe software și hardware

Pentru rularea aplicației este necesar un sistem capabil să execute
containere Docker și procese Node.js. Cerințele recomandate sunt
prezentate în Tabelul [7.1](#tab:cerinte-instalare){reference-type="ref"
reference="tab:cerinte-instalare"}.

::: {#tab:cerinte-instalare}
  **Resursă**          **Cerință recomandată**
  -------------------- ----------------------------------------------------------------------------------------
  Sistem de operare    Windows 10/11 sau o distribuție Linux compatibilă cu Docker.
  Docker               Docker Desktop sau Docker Engine, utilizat pentru pornirea serviciilor locale.
  Node.js și npm       Versiune LTS recentă, necesară pentru aplicația Next.js și scripturile auxiliare.
  Git                  Necesar pentru obținerea proiectului din repository.
  Browser web          Browser modern, de exemplu Google Chrome, Microsoft Edge sau Firefox.
  Memorie RAM          Minimum 8 GB RAM recomandați pentru rularea simultană a serviciilor.
  Spațiu pe disc       Spațiu liber pentru imaginile Docker, volumele locale și dependențele proiectului.
  Conexiune internet   Necesară la prima instalare, pentru descărcarea imaginilor Docker și a pachetelor npm.

  : Cerințe software și hardware pentru rularea aplicației
:::

Python este necesar doar dacă serviciul de predicție ARIMA este rulat
manual în afara containerelor Docker. În configurația locală
recomandată, acesta este pornit prin Docker Compose.

## Configurarea mediului local

După obținerea proiectului, terminalul trebuie deschis în directorul
rădăcină al aplicației. Fișierul `docker-compose.yml` definește
serviciile locale, iar fișierul `web-app/.env` conține variabilele
utilizate de aplicația web și de worker-ul MQTT.

Pentru mediul demonstrativ local se pot utiliza valorile implicite din
Tabelul [7.2](#tab:variabile-mediu){reference-type="ref"
reference="tab:variabile-mediu"}. Aceste valori sunt adecvate pentru
rulare locală, dar nu trebuie folosite nemodificate într-un mediu de
producție.

::: {#tab:variabile-mediu}
  **Variabilă**               **Rol**
  --------------------------- -----------------------------------------------------------------------------
  `DATABASE_URL`              Conexiunea aplicației la baza de date PostgreSQL pentru metadate.
  `CHIRPSTACK_DATABASE_URL`   Conexiunea utilizată de scripturile de provisioning pentru baza ChirpStack.
  `INFLUX_URL`                Adresa locală a serviciului InfluxDB.
  `INFLUX_TOKEN`              Tokenul folosit pentru accesarea bucket-ului InfluxDB.
  `INFLUX_ORG`                Organizația InfluxDB configurată local.
  `INFLUX_BUCKET`             Bucket-ul în care sunt salvate citirile contoarelor.
  `MQTT_BROKER_URL`           Adresa brokerului MQTT local.
  `FORECAST_SERVICE_URL`      Adresa serviciului ARIMA, expus local pe portul `8001`.
  `SIMULATOR_API_URL`         Adresa API-ului simulatorului LoRaWAN.
  `JWT_SECRET`                Cheia locală folosită pentru semnarea sesiunilor utilizatorilor.

  : Variabile de mediu importante pentru rularea locală
:::

## Pornirea aplicației

Pornirea mediului local se realizează în două etape. Mai întâi se
pornesc serviciile definite în Docker Compose, apoi se pornesc aplicația
web și worker-ul MQTT din directorul `web-app`.

    docker compose up -d --build
    cd web-app
    npm install
    npx prisma migrate deploy
    npm run prisma:generate
    npm run dev:all

Serviciile locale principale sunt prezentate în Tabelul
[7.3](#tab:servicii-porturi){reference-type="ref"
reference="tab:servicii-porturi"}.

::: {#tab:servicii-porturi}
  **Serviciu**     **Adresă locală**         **Rol**
  ---------------- ------------------------- ----------------
  Aplicația web    `http://localhost:3000`   Dashboard
  ChirpStack       `http://localhost:8080`   Server LoRaWAN
  InfluxDB         `http://localhost:8086`   Date istorice
  LWN Simulator    `http://localhost:8000`   Simulare
  Serviciu ARIMA   `http://localhost:8001`   Predicție

  : Servicii locale și porturi utilizate
:::

## Inițializarea datelor demonstrative

Pentru ca dashboard-ul să conțină utilizatori, contoare și date
istorice, trebuie rulate scripturile de inițializare din directorul
`web-app`:

    cd web-app
    npm run provision:demo-devices
    npm run seed:history

Scriptul `provision:demo-devices` creează sau actualizează conturile
demonstrative și dispozitivele asociate acestora. Dispozitivele sunt
create în simulator, în ChirpStack și în baza de date a aplicației,
păstrând același identificator `devEui`. După rularea scriptului,
simulatorul trebuie pornit din interfața LWN Simulator pentru ca
dispozitivele să emită mesaje noi. Scriptul `seed:history` generează
citiri istorice pentru graficele de consum și pentru modulul ARIMA.

Conturile demonstrative sunt prezentate în Tabelul
[7.4](#tab:conturi-demo){reference-type="ref"
reference="tab:conturi-demo"}.

::: {#tab:conturi-demo}
  **Email**                    **Parolă**     **Cod de revendicare**
  ---------------------------- -------------- ------------------------
  `company.demo@example.com`   `Demo12345!`   `COMPANY-DEMO-2026`
  `user1.demo@example.com`     `Demo12345!`   `USER1-DEMO-2026`
  `user2.demo@example.com`     `Demo12345!`   `USER2-DEMO-2026`
  `user3.demo@example.com`     `Demo12345!`   `USER3-DEMO-2026`

  : Conturi demonstrative disponibile în aplicație
:::

## Utilizarea aplicației

### Autentificarea

Utilizatorul accesează aplicația la adresa `http://localhost:3000` și
introduce adresa de email și parola contului. Pentru demonstrarea
scenariului de companie se poate utiliza contul
`company.demo@example.com`.

### Prezentarea generală a flotei

Pagina de prezentare generală oferă o imagine agregată asupra
dispozitivelor asociate contului. Utilizatorul poate observa numărul
total de contoare, categoriile de utilități, costurile estimate și
starea fluxului live.

<figure id="fig:manual-overview" data-latex-placement="h!">
<img src="./imagini/02_overview.png" style="width:75.0%" />
<figcaption>Pagina de prezentare generală a flotei</figcaption>
</figure>

### Administrarea dispozitivelor

Pagina de dispozitive permite vizualizarea inventarului de contoare.
Utilizatorul poate căuta un dispozitiv după nume sau `devEui`, poate
filtra lista după stare și poate accesa acțiuni precum vizualizarea
detaliilor sau editarea metadatelor. Pentru flote mai mari, lista este
paginată, astfel încât interfața să rămână ușor de utilizat.

<figure id="fig:manual-devices" data-latex-placement="h!">
<img src="./imagini/03_devices.png" style="width:75.0%" />
<figcaption>Pagina de administrare a dispozitivelor</figcaption>
</figure>

În cazul unui cont nou, utilizatorul poate folosi un cod de revendicare
pentru a asocia dispozitivele pregătite anterior. Codul se introduce în
panoul dedicat din pagina de dispozitive.

### Vizualizarea unui contor individual

Pagina contorului individual prezintă informațiile detaliate pentru
dispozitivul selectat. Utilizatorul poate consulta citirile recente,
profilul de consum, costul estimat și predicția ARIMA pentru intervalul
următor. Selectorul de dispozitive permite schimbarea contorului
analizat fără revenirea la pagina de inventar.

<figure id="fig:manual-meter" data-latex-placement="h!">
<img src="./imagini/04_meter.png" style="width:75.0%" />
<figcaption>Pagina contorului individual și prognoza ARIMA</figcaption>
</figure>

### Analiza costurilor

Pagina de facturare prezintă costurile estimate pentru dispozitive și
pentru categoriile de utilități. Valorile afișate au rol orientativ și
sunt calculate pe baza tarifelor definite în aplicație și a consumurilor
disponibile. Această pagină este utilă pentru identificarea contoarelor
sau utilităților care contribuie cel mai mult la costul total.

<figure id="fig:manual-billing" data-latex-placement="h!">
<img src="./imagini/05_billing.png" style="width:75.0%" />
<figcaption>Pagina de analiză a costurilor</figcaption>
</figure>

### Vizualizarea pe hartă

Modul de hartă este disponibil din pagina de prezentare generală. Acesta
afișează contoarele pe baza coordonatelor geografice configurate.
Utilizatorul poate filtra dispozitivele după tipul utilității sau stare
și poate selecta un contor pentru a vedea informațiile sale principale.

<figure id="fig:manual-map" data-latex-placement="h!">
<img src="./imagini/07_map.png" style="width:75.0%" />
<figcaption>Vizualizarea geografică a dispozitivelor</figcaption>
</figure>

# Concluzii

Lucrarea de față a avut ca obiectiv proiectarea, implementarea și
validarea unei platforme pentru monitorizarea consumului de utilități
printr-un flux IoT bazat pe LoRaWAN. Sistemul dezvoltat demonstrează
integrarea mai multor componente software specifice aplicațiilor
distribuite moderne: simulare de dispozitive, server de rețea LoRaWAN,
broker MQTT, procesare de telemetrie, stocare relațională și
time-series, interfață web operațională și modul de predicție a
consumului.

Din punct de vedere funcțional, aplicația permite monitorizarea mai
multor categorii de contoare inteligente, corespunzătoare utilităților
de tip electricitate, gaz, apă, încălzire și răcire. Datele generate de
simulator sunt transmise prin infrastructura ChirpStack, publicate prin
MQTT, procesate de worker-ul aplicației și salvate în InfluxDB.
Metadatele dispozitivelor, utilizatorii, tarifele și relațiile de
ownership sunt gestionate separat în PostgreSQL. Această separare
reflectă o decizie arhitecturală importantă, deoarece telemetria are
caracter temporal și volum ridicat, în timp ce datele aplicației au
caracter relațional.

## Contribuții realizate

Prima contribuție importantă constă în realizarea unui flux complet de
date, de la dispozitivul LoRaWAN simulat până la afișarea informațiilor
în dashboard. Chiar dacă mediul folosește dispozitive simulate, traseul
tehnic reproduce etapele principale ale unei integrări IoT reale:
generarea pachetelor, transmiterea prin gateway bridge, gestionarea
dispozitivelor în ChirpStack, publicarea mesajelor MQTT și ingestia în
baza de date time-series.

A doua contribuție este reprezentată de implementarea aplicației web,
care oferă utilizatorului o interfață centralizată pentru vizualizarea
flotei de dispozitive. Dashboard-ul include pagini pentru prezentare
generală, administrarea contoarelor, analiza unui contor individual,
estimarea costurilor și vizualizarea geografică. De asemenea, aplicația
diferențiază între conturi de companie și utilizatori individuali, iar
asocierea dispozitivelor este realizată printr-un mecanism de
revendicare pe bază de cod.

A treia contribuție constă în integrarea unui modul predictiv bazat pe
modelul ARIMA. Acesta utilizează datele istorice agregate din InfluxDB
pentru a genera estimări pe termen scurt ale consumului. Integrarea
acestui modul transformă aplicația dintr-un sistem strict descriptiv
într-un sistem care include și analiză predictivă, oferind
utilizatorului o perspectivă asupra evoluției probabile a consumului.

## Analiză critică a rezultatelor

Rezultatele obținute arată că sistemul implementat îndeplinește
obiectivele principale propuse. Fluxul de date este funcțional,
dispozitivele pot fi gestionate și asociate utilizatorilor, valorile de
consum sunt afișate în interfață, iar predicția ARIMA poate fi calculată
pentru seriile istorice disponibile. Testele statice, unitare, de
integrare și validările vizuale au confirmat funcționarea componentelor
principale.

Cu toate acestea, sistemul are și limitări. Cea mai importantă limitare
este folosirea unui simulator în locul unor contoare și gateway-uri
fizice. Această alegere permite dezvoltarea și validarea logicii
software, dar nu acoperă aspecte precum interferențele radio, pierderile
de pachete în condiții reale, autonomia energetică a dispozitivelor sau
comportamentul hardware. În plus, tarifele utilizate pentru calculul
costurilor sunt statice și au rol demonstrativ, deci rezultatele nu
trebuie interpretate ca facturare reală.

O altă limitare este faptul că predicția ARIMA este calculată la cerere
și depinde de calitatea datelor istorice disponibile. Modelul este
potrivit pentru demonstrarea predicției pe termen scurt, însă
performanța sa poate varia în funcție de regularitatea consumului și de
comportamentul fiecărui dispozitiv. Pentru un sistem de producție ar fi
necesară o evaluare mai amplă a acurateței predicțiilor, folosind date
reale și indicatori cantitativi precum MAE, RMSE sau MAPE.

## Dezvoltări ulterioare

O direcție evidentă de dezvoltare este înlocuirea simulatorului cu
dispozitive LoRaWAN reale. Acest pas ar permite validarea sistemului în
condiții operaționale și ar oferi o evaluare mai realistă a performanței
fluxului de comunicație. În același timp, ar putea fi analizate aspecte
precum configurarea gateway-urilor, acoperirea radio și comportamentul
dispozitivelor în timp.

O altă direcție este extinderea modulului de predicție. Pe lângă ARIMA,
sistemul ar putea integra metode precum Holt-Winters, Random Forest sau
rețele neuronale recurente, iar rezultatele acestora ar putea fi
comparate pe aceleași seturi de date. De asemenea, predicțiile ar putea
fi salvate periodic, nu doar calculate la cerere, pentru a permite
analiză istorică asupra calității forecast-ului.

Aplicația poate fi extinsă și din perspectiva funcționalităților oferite
utilizatorului. Exemple relevante sunt definirea unor alerte pentru
consum anormal, exportul rapoartelor, configurarea unor tarife
diferențiate pe intervale orare și adăugarea unor roluri administrative
mai detaliate. Pentru un scenariu comercial, ar fi necesare și mecanisme
suplimentare de securitate, audit și administrare a organizațiilor.

În concluzie, proiectul demonstrează că o platformă locală bazată pe
LoRaWAN, MQTT, baze de date specializate și dashboard web poate fi
utilizată pentru monitorizarea și analiza consumului de utilități.
Soluția implementată acoperă întregul traseu al datelor, de la generare
până la vizualizare și predicție, și oferă o bază tehnică extensibilă
pentru dezvoltări ulterioare în domeniul monitorizării inteligente a
utilităților.
