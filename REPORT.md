# REPORT

See fail kirjeldab, mis töötab rakenduses ning kus on potentsiaalsed riskid / probleemid,
vastavalt automaatsete E2E testide tulemustele (Playwright).

## 1. Mis töötab hästi

1. **Sisselogimine töötab nii `opilane/opilane` kui `admin/admin`.**  
   Testid `01_opilane_login.spec.ts` ja `02_admin_login.spec.ts` kinnitavad, et mõlemad rollid saavad sisse.
   See tähendab, et autentimine üldse toimib.

2. **Vale parool ei luba siseneda.**  
   Test `03_vale_parool.spec.ts` näitab, et kui parool on vale, kasutaja jääb loginulehele
   ja ei näe adminivaadet. See on oluline turvalisuse seisukohalt.

3. **Logi välja (`Logi välja`) viib kasutaja tagasi loginulehele.**  
   Testid `04_opilane_logout.spec.ts` ja `05_admin_logout.spec.ts` kinnitavad,
   et nii tavaline kasutaja kui admin saavad sessiooni lõpetada.
   See tähendab, et sessioon lõpetatakse ja kaitstud vaade ei jää avatuks.

4. **Admini vaade on olemas ja funktsionaalne.**  
   Test `06_admin_vaade.spec.ts` kinnitab:
   - On olemas tervitustekst `Tere, admin!`.
   - On olemas tabel kaupadega koos veergudega (Nimetus, Kaubagrupp, Hind).
   - Tabelis igal real on lingid `Kustuta` ja `Muuda`.
   - Vorm `Kauba lisamine` on nähtav koos väljadega `nimetus`, `hind`, rippmenüü `kaubagrupi_id`
     ja nupuga `Lisa kaup`.
   - Sisendvälju saab täita (nimetus, hind).

   See tähendab, et administraatoril on tegelik kontroll kaubaandmete üle.

5. **Kasutajaliides (UI) reageerib kohe.**  
   Testides ei kasutata kunstlikke ootamisi nagu `wait(2000)`.  
   Kõik kontrollid põhinevad lehe tegelikul seisundil (`toBeVisible`, `toHaveURL`, jne).
   See on hea praktika E2E testimisel.

## 2. Tähelepanekud / potentsiaalsed probleemid

1. **Andmete lisamine vormiga ei ole lõpuni testitud.**  
   Test `06_admin_vaade.spec.ts` sisestab uue toote (`nimetus`, `hind`), kuid ei vajuta `Lisa kaup`.
   Põhjus: mitte rikkuda/prahti täis kirjutada päris andmebaasi.  
   See tähendab, et "lisa kaup" submit pole automaatselt kinnitatud,
   kuigi väljade olemasolu ja täitmine on kinnitatud.

2. **"Kustuta" ja "Muuda" linke ei vajutata.**  
   Linke `Kustuta` ja `Muuda` testitakse ainult nähtavuse mõttes.  
   Me EI tee tegelikku kustutamist / muutmist, sest vastasel juhul võib muutuda globaalne olek
   ja teised testid hakkaksid käituma erinevalt.  
   See on teadlik piirang korduvkäidavuse (repeatability) nimel.

3. **Rollierinevused pärast login'i.**  
   Test eeldab, et adminil kuvatakse `Tere, admin!`.  
   Kui rakenduse tekst muutub (nt `Tere, ADMINISTRATOR!`), siis test kukub.  
   See sõltuvus konkreetsele stringile on habras, aga väga selge.

4. **URL pärast login'i.**  
   Õpilase test (`01_opilane_login.spec.ts`) kontrollib negatiivselt:
   "pärast login'it URL ei ole enam `login2.php`".  
   Kui kunagi loginusüsteem jääb samale URL-ile ja renderdab lihtsalt teist sisu,
   siis kontroll tuleb ajakohastada sisu põhjal (nt `Tere, ...`),
   mitte URL'i põhjal.

5. **Automaattestid ei kontrolli serveripoolset turvet.**  
   Me ei testi otse, kas õpilane saab ligi admin-lehele, kui ta sisestab URL otse.
   Seda võiks lisada lisatestina tulevikus (autoriseerimine / access control).

## 3. Automaatika artefaktid

Playwright loob automaatselt aruandeid:
- kui teste käivitada CLI kaudu `npx playwright test`,
  tekib kaust `playwright-report/` (HTML aruanne) ja `test-results/`.
- `--ui` režiim näitab samme, requeste, screenshot'e ja trace'i otse aknas.

Need aruanded aitavad visuaalselt kinnitada,
mis täpselt läks valesti, kui test punaseks läheb.

## 4. Kokkuvõte

- Olulised põhifunktsioonid (login, logout, roll admin, haldusvaade) töötavad.
- Parooli kontroll töötab (vale parool ei luba sisse).
- Admin näeb halduskomponente (vorm, tabel, lingid Kustuta/Muuda).

Peamised piirangud:
- Me ei tee destruktiivseid muudatusi (Kustuta, Lisa kaup).
- Me ei kinnita, et sisestatud uus kaup tekib tabelisse.
- Me ei testi otse autoriseerimise piiranguid (nt kas õpilane saab avada admini URL-i).

Üldiselt: süsteem on funktsionaalne, UI on nähtav ja kasutajavood on läbimängitavad.
