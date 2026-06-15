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
