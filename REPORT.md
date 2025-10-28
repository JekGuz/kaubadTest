# REPORT

See fail kirjeldab, mis töötab rakenduses ning kus on potentsiaalsed riskid / probleemid,
vastavalt automaatsete E2E testide tulemustele (Playwright).

## 1. Mis töötab hästi

1. **Sisselogimine töötab nii `opilane/opilane` kui `admin/admin`.**  
   Testid `01_opilane_login.spec.ts` ja `02_admin_login.spec.ts` kinnitavad, et mõlemad rollid saavad sisse.  
   See tähendab, et autentimine üldse toimib ja kasutajaid eristatakse õigesti.

2. **Vale parool ei luba siseneda.**  
   Test `03_vale_parool.spec.ts` näitab, et kui parool on vale, kasutaja jääb loginulehele  
   ja ei näe kaitstud vaadet. See on oluline turvalisuse seisukohalt.

3. **Logi välja (`Logi välja`) viib kasutaja tagasi loginulehele.**  
   Testid `04_opilane_logout.spec.ts` ja `05_admin_logout.spec.ts` kinnitavad,  
   et nii tavaline kasutaja kui admin saavad sessiooni lõpetada.  
   See tähendab, et sessioon lõpetatakse ja kaitstud vaade ei jää avatuks.

4. **Admini vaade on olemas ja funktsionaalne.**  
   Test `06_admin_vaade.spec.ts` kinnitab:
   - On olemas tervitustekst `Tere, admin!`.  
   - On olemas tabel kaupadega koos veergudega (Nimetus, Kaubagrupp, Hind).  
   - Tabelis igal real on lingid `Kustuta` ja `Muuda`.  
   - Vorm `Kauba lisamine` on nähtav koos väljadega `nimetus`, `hind`, `kaubagrupi_id`  
     ja nupuga `Lisa kaup`.  
   - Sisendvälju saab täita (nimetus, hind) ilma vigu tekitamata.

5. **Kasutajaliides (UI) reageerib kohe.**  
   Testides ei kasutata kunstlikke ootamisi nagu `wait(2000)`.  
   Kõik kontrollid põhinevad lehe tegelikul seisundil (`toBeVisible`, `toHaveURL`, jne).  
   See on hea praktika E2E testimisel ja tagab stabiilse jooksu.

6. **Admin saab lisada ja kustutada kaupu (CRUD test).**  
   Test `07_admin_lisa_ja_kustuta.spec.ts` kinnitab, et:
   - Admin saab lisada uue kauba vormiga `Kauba lisamine`.  
   - Uus kaup ilmub tabelisse kohe pärast nupu **Lisa kaup** vajutamist.  
   - Admin saab sama kauba kustutada lingiga **Kustuta**.  
   - Pärast kustutamist rida kaob tabelist.  
   Kõik lisatud kaubad on ajutised ja puhastatakse automaatselt testilõpus.

---

## 2. Tähelepanekud / potentsiaalsed probleemid

1. **Rollierinevused pärast login'i.**  
   Test eeldab, et adminil kuvatakse täpselt `Tere, admin!`.  
   Kui rakenduse tekst muutub (nt `Tere, administraator!`), siis test kukub.  
   See sõltuvus konkreetsele stringile on habras, aga väga selge ja loogiline.

2. **URL pärast login'i.**  
   Õpilase test (`01_opilane_login.spec.ts`) kontrollib negatiivselt:  
   "pärast login'it URL ei ole enam `login2.php`".  
   Kui loginusüsteem jääb samale URL-ile ja renderdab lihtsalt uut sisu,  
   tuleb kontroll ajakohastada sisu põhjal (nt tervitusteksti järgi).

3. **Automaattestid ei kontrolli autoriseerimise piiranguid.**  
   Me ei testi, kas `opilane` saab otse avada admini URL-i käsitsi.  
   Tulevikus võiks lisada eraldi test autoriseerimise kontrolliks (access control).

4. **CRUD test muudab andmebaasi sisu.**  
   Kuna test `07_admin_lisa_ja_kustuta.spec.ts` lisab ja kustutab reaalselt andmeid,  
   võib testijooksu ajal andmebaasis hetkeks tekkida ajutisi ridu.  
   Test puhastab need ise, kuid kui serveris tekib tõrge (nt kustutamine ebaõnnestub),  
   võib mõni `autotest_…` kaup jääda alles.  
   Sellisel juhul võib need käsitsi eemaldada või testi uuesti käivitada.

5. **Kustutamise kinnituse (`confirm`) dialoog.**  
   Kui veebileht kasutab JavaScripti `confirm()` dialoogi,  
   aktsepteerib test selle automaatselt. Kui mehhanismi muudetakse (nt AJAX kustutamine ilma dialoogita),  
   tuleb test uuendada.

6. **Keskkonnamuutujate kasutamine.**  
   Kui `.env` faili ei kasutata, võtavad testid vaikimisi väärtused `admin/admin` ja `opilane/opilane`.  
   See sobib demoks, kuid soovitatav on kasutada `.env` faile, et vältida tundlike andmete lekkeid.

---

## 3. Automaatika artefaktid

Playwright loob automaatselt aruandeid ja visuaalseid tõendeid testijooksu kohta:

- Käivitus `npx playwright test` loob kaustad:
  - **`playwright-report/`** → HTML aruanne (ava käsuga `npx playwright show-report` või `npm run report:open`);
  - **`test-results/`** → trace, screenshotid ja videod tõrgete korral.
- Kui test käivitada UI-režiimis (`npx playwright test --ui`), saab näha:
  - iga sammu, nupuvajutust ja sisestust,
  - võrrelda "Before / After" seisundeid,
  - trace’i, võrku ja konsooli logisid.

Need artefaktid aitavad tuvastada vigu ja dokumenteerida automaattestide töökindlust.

---

## 4. Kokkuvõte

- Kõik põhifunktsioonid (login, logout, rollid, adminivaade) töötavad ootuspäraselt.  
- Paroolikontroll toimib korrektselt — vale parool ei lase siseneda.  
- Admini haldusvaade on nähtav ja funktsionaalne (vorm, tabel, Kustuta/Muuda lingid).  
- CRUD test (`07_admin_lisa_ja_kustuta.spec.ts`) kinnitab, et lisamine ja kustutamine toimivad reaalselt.  
- UI reageerib kiiresti ja ilma kunstlike ootamisteta.

**Peamised piirangud:**
- Testid töötavad otse elava serveri ja andmebaasiga — see võib tekitada ajutisi andmeridu.  
- Autoriseerimist (kas õpilane saab admin-lehele otse) ei testita.  
- Testid sõltuvad mõnest tekstist (`Tere, admin!`), mida tuleks muuta, kui lehe sisu uuendatakse.

Üldiselt: süsteem on funktsionaalne, UI on nähtav ja kasutajate põhiprotsessid  
(login → haldus → logout → CRUD) on automatiseeritud ja stabiilselt testitud.
