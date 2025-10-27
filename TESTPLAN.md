# TESTPLAN

## Ülevaade

See testiplaan kirjeldab E2E teste, mis kontrollivad lihtsat PHP-põhist kaubahalduse veebirakendust.  
Fookus on kolmel põhiasjal:
1. Autentimine (õpilane vs admin).
2. Ligipääsu kontroll (vale parool ei lase sisse, logout töötab).
3. Admini vaade (tabel kaupadega, vorm uue kauba lisamiseks, haldusnupud).

Need tegevused on kõige kriitilisemad, sest:
- Kui sisselogimine ei tööta, keegi ei pääse rakendusse.
- Kui välja logimine ei tööta, siis turvalisus on katki.
- Kui admin ei näe kaupu ega ei saa neid hallata, siis rakendus ei täida oma eesmärki.

Testid on automatiseeritud Playwright’iga ning käituvad samamoodi nagu päris kasutaja: avavad brauseri, sisestavad andmed, vajutavad nuppe, ootavad lehe seisundit.


---

## Stsenaarium 1: Õpilane saab sisse logida

**Algseis:** Kasutaja asub loginulehel (`login2.php`) ja ei ole veel sisse logitud.  
**Tegevus:** Kasutaja sisestab `opilane / opilane` ning vajutab nuppu "Logi sisse".  
**Ootus:** Kasutajat ei jäeta tagasi loginulehele. Uuel lehel on näha tervitus (näiteks tekst `Tere ...`).

(Miks oluline: kontrollib, et tavakasutaja pääseb süsteemi ja autentimine üldse töötab.)

Fail: `test/01_opilane_login.spec.ts`  
Test: `opilane saab sisse`


---

## Stsenaarium 2: Admin saab sisse logida

**Algseis:** Admin on loginulehel ja ei ole veel sisse logitud.  
**Tegevus:** Admin sisestab `admin / admin` ja vajutab "Logi sisse".  
**Ootus:** Avaneb adminivaade ning kuvatakse tekst `Tere, admin!`.

(Miks oluline: kinnitab, et on olemas eraldi administraatori roll.)

Fail: `test/02_admin_login.spec.ts`  
Test: `admin saab sisse`


---

## Stsenaarium 3: Vale parool ei lase sisse

**Algseis:** Kasutaja on loginulehel.  
**Tegevus:** Ta sisestab õige kasutajanime, aga vale parooli, ja vajutab "Logi sisse".  
**Ootus:** Ta EI pääse kaitstud lehele. Ta jääb loginulehele (`login2.php`) ja näeb endiselt login/parool välju.

(Miks oluline: kontrollib, et süsteem ei aktsepteeri suvalisi paroole ehk turvalisus pole täiesti katki.)

Fail: `test/03_vale_parool.spec.ts`  
Test: `vale parool annab vea ja ei lase sisse`


---

## Stsenaarium 4: Õpilane saab välja logida

**Algseis:** Kasutaja `opilane` on edukalt sisse loginud.  
**Tegevus:** Ta vajutab nuppu "Logi välja".  
**Ootus:** Talle kuvatakse uuesti loginuleht (login ja parooli väljad taas nähtavad).

(Miks oluline: kasutaja peab saama oma sessiooni sulgeda. Kui see ei tööta, on turvarisk.)

Fail: `test/04_opilane_logout.spec.ts`  
Test: `opilane logout töötab`


---

## Stsenaarium 5: Admin saab välja logida

**Algseis:** Admin `admin / admin` on sisse logitud ja näeb adminivaadet.  
**Tegevus:** Ta vajutab "Logi välja".  
**Ootus:** Ta viiakse tagasi loginulehele (`login2.php`) ja loginiväljad on uuesti nähtavad.

(Miks oluline: admin peab saama oma sessiooni lõpetada pärast haldustegevusi.)

Fail: `test/05_admin_logout.spec.ts`  
Test: `admin logout töötab`


---

## Stsenaarium 6: Admini vaade kuvab haldustööriistad

**Algseis:** Admin `admin / admin` on sisse loginud.  
**Tegevus:** Admin vaatab põhilehte pärast sisselogimist.  
**Ootus:**  
- Näha on tervitus `Tere, admin!`.  
- Tabel kaupadega on olemas ja mitte tühi.  
- Igal kaubareal on lingid "Kustuta" ja "Muuda".  
- Vorm "Kauba lisamine" on nähtav (väljad: `nimetus`, `hind`, `kaubagrupi_id`, nupp "Lisa kaup").  
- Väljadesse saab kirjutada, ilma et kohe oleks vaja salvestada.  
- Adminil on nähtav nupp "Logi välja".

(Miks oluline: see kinnitab, et administraatoril on juurdepääs tegelikele haldusfunktsioonidele: vaadata, lisada, muuta, kustutada kaupu.)

Fail: `test/06_admin_vaade.spec.ts`  
Test: `admini vaade: tabel, vorm ja halduslingid`


---

## Failid ja struktuur

- `test/01_opilane_login.spec.ts`  
- `test/02_admin_login.spec.ts`  
- `test/03_vale_parool.spec.ts`  
- `test/04_opilane_logout.spec.ts`  
- `test/05_admin_logout.spec.ts`  
- `test/06_admin_vaade.spec.ts`

Iga testifail sisaldab:
- Lühikirjeldus kolmes osas (Algseis / Tegevus / Ootus).
- Ühte iseseisvat stsenaariumi.
- Sisenemine (login) tehakse testis sees; test ei sõltu eelnevast testist.

> Märkus enda jaoks / Историческое примечание:
> Alguses kõik testid olid koos failis `auth.spec.ts`, ühe suure plokina.
> Nüüd nad on eraldi failides vastavalt nõudele: "Minimum viis sõltumatut stsenaariumi, igaüks eraldi failis."

See vastab nõudele, et testid oleks korduvkäidavad, isoleeritud ja loetavad.


---
