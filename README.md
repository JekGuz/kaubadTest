# Kaubad – E2E testid Playwrightiga

See projekt sisaldab:
- lihtsat PHP-põhist veebirakendust kaupade haldamiseks (sisselogimine, kaubaloend, haldusvaade adminile),
- automaatseid E2E teste Playwrightiga.

Testide eesmärk on kontrollida:
- kas kasutajad saavad sisse logida (õpilane, admin);
- kas vale parool blokeeritakse;
- kas "Logi välja" töötab;
- kas admini vaade (kaupade tabel + haldusvorm) on korras ja nähtav.

---

## 1. Süsteeminõuded

See projekt on testitud järgmises keskkonnas:

- Operatsioonisüsteem: Windows 10 või uuem.
- Node.js: soovituslikult 18.x või uuem (LTS sobib).
- npm: tuleb koos Node.js-ga.
- Brauserid: Playwright paigaldab ise vajalikud brauserid (Chromium, WebKit, Firefox).

PHP rakendus ise jookseb serveris (nt `thkit.ee`). Kohalikus masinas ei pea PHP-d eraldi käivitama – lokaalselt käivitatakse ainult testid.

---

## 2. Projekti ettevalmistamine (esmakordsel masinal)

Tee järgmised sammud puhtal arvutil:

1. Lae projekt alla (kas `git clone` või ZIP lahti pakkida).
2. Ava terminal (PowerShell või cmd) selle projekti kaustas (kus on `package.json`).
3. Paigalda sõltuvused:

   PowerShellis või cmd-s:
   ```bash
   npm install
   ```

   Kui PowerShell blokib `npm` käsku (ExecutionPolicy vms), kasuta varianti:
   ```bash
   npm.cmd install
   ```

4. Paigalda Playwrighti brauserid (Chromium jne):
   ```bash
   npx playwright install
   ```

   Kui PowerShell ei luba `npx` (annab vea digiallkirja/poliitika kohta), kasuta cmd-versiooni:
   ```bash
   cmd /c npx playwright install
   ```

5. (Soovitatav) Kopeeri fail `.env.example` uueks failiks `.env` ja kohanda väärtused vajadusel.  
   `.env.example` kirjeldab URL-i ja testkasutajate nime/parooli, mida testid eeldavad.
   `.env` faili **ei panda** reposse, ainult `.env.example` läheb versioonihaldusesse.

---

## 3. E2E testide käivitamine

### Variant A: Interaktiivne UI (soovitatav arenduse ajal)

See avab Playwright Test Runner UI akna, kus saab teste ükshaaval käivitada, näha samme, URL-e ja trace’i.

Käivita:
```bash
cmd /c npx playwright test --ui
```

UI-s näed:
- vasakul: kõiki testifaile (`01_opilane_login.spec.ts`, `02_admin_login.spec.ts`, jne);
- iga testi kõrval ▶ nupp jooksutamiseks;
- paremal: brauseri eelvaade ja sammude logi.

See režiim sobib demo / esitlus / kontrolltöö jaoks, sest kõik on visuaalselt nähtav.

### Variant B: Käsurealt (CI / automaatne jooks)

Käivita kõik testid ilma UI-ta:
```bash
cmd /c npx playwright test
```

Pärast jooksu:
- kaust `playwright-report/` → HTML raport;
- kaust `test-results/` → trace, screenshotid jms tõrkeanalüüsi jaoks.

Neid kaustu (eriti `playwright-report/`) saab mainida ja/või linkida failis `REPORT.md`.

---

## 4. Testifailide struktuur

Kõik testid asuvad kaustas `test/`.  
Iga stsenaarium on eraldi failis (nõue: "igaüks eraldi failis").  
Iga faili alguses on kirjas `Algseis / Tegevus / Ootus`, et oleks selge, mida täpselt kontrollitakse.

### `test/01_opilane_login.spec.ts`
Kontrollib, et kasutaja `opilane` saab edukalt sisse logida (`opilane / opilane`).

- Algseis: kasutaja on loginulehel.
- Tegevus: sisestab kasutajanime ja parooli, vajutab "Logi sisse".
- Ootus: kasutajat ei jäeta loginulehele; kuvatakse tervitus (nt "Tere ...").

Miks oluline: kinnitab, et tavaline kasutaja saab süsteemi sisse.

---

### `test/02_admin_login.spec.ts`
Kontrollib, et admin saab sisse (`admin / admin`) ja näeb admini vaadet.

- Algseis: admin on loginulehel.
- Tegevus: sisestab `admin / admin`, vajutab "Logi sisse".
- Ootus: lehel on tekst `Tere, admin!`.

Miks oluline: eristab admini rolli tavakasutajast.

---

### `test/03_vale_parool.spec.ts`
Kontrollib, et vale parool EI luba süsteemi sisse.

- Algseis: loginuleht on avatud.
- Tegevus: sisestatakse õige kasutajanimi, aga vale parool.
- Ootus: kasutaja jääb `login2.php` lehele, login/parool väljad on endiselt nähtavad.

Miks oluline: turvalisus – suvalise parooliga ei saa süsteemi.

---

### `test/04_opilane_logout.spec.ts`
Kontrollib, et õpilane saab välja logida nupu "Logi välja" kaudu.

- Algseis: `opilane` on edukalt sisse loginud.
- Tegevus: vajutab "Logi välja".
- Ootus: suunatakse tagasi loginulehele; loginiväljad on taas nähtavad.

Miks oluline: pärast kasutamist peab saama sessiooni sulgeda.

---

### `test/05_admin_logout.spec.ts`
Kontrollib, et admin saab välja logida.

- Algseis: `admin` on edukalt sisse loginud ja näeb `Tere, admin!`.
- Tegevus: vajutab "Logi välja".
- Ootus: tagasitulek loginulehele (`login2.php`), sisselogimisväljad on nähtavad.

Miks oluline: admini sessioon ei tohi jääda avatuks pärast haldust.

---

### `test/06_admin_vaade.spec.ts`
Kontrollib admini vaadet pärast edukat sisselogimist adminina.

Test kinnitab, et pärast `admin / admin` login’i:
- kuvatakse `Tere, admin!`;
- on olemas kaupade tabel, ja tabel EI ole tühi;
- igal kaubareal on halduslingid `Kustuta` ja `Muuda`;
- vorm "Kauba lisamine" on nähtav (`nimetus`, `hind`, `kaubagrupi_id`, nupp "Lisa kaup");
- välju saab täita (st saab sisestada uue kauba andmed);
- nupp "Logi välja" on nähtav.

NB: Test EI vajuta tegelikult "Lisa kaup" ega "Kustuta", et mitte muuta päris andmebaasi serveris.  
See on teadlik otsus, et testid oleks korduvkäivitatavad ja ei teeks püsivaid / hävitavaid muudatusi.

---

## 5. Keskkonnamuutujad (`.env.example`)

Repos on fail `.env.example`.  
See fail näitab, milliseid väärtusi testid eeldavad.  
See EI sisalda saladusi – see on ainult näidis vastavalt nõudele "näidisfail keskkonnamuutujate jaoks ilma saladusteta".

Näide `.env.example` sisust:

```env
# Login-lehe URL, kuhu testid lähevad:
LOGIN_URL=https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php

# Õpilase konto (õigused: vaadata)
STUDENT_USER=opilane
STUDENT_PASS=opilane

# Admini konto (õigused: haldus, kustuta/muuda/lisa)
ADMIN_USER=admin
ADMIN_PASS=admin
```

Kasutusmuster on:
1. Tee `.env.example` koopia uue failina `.env` (lokaalselt).
2. (Soovi korral) testi koodis võib lugeda neid väärtusi `process.env.LOGIN_URL`, `process.env.ADMIN_USER`, jne.

Praeguses versioonis testid kasutavad väärtusi otse koodis, kuna see on lihtsam algtaseme ülesande jaoks.  
Aga `.env.example` on lisatud, et näidata, milliseid keskkonnaandmeid võiks / peaks eraldi hoidma.

---

## 6. Märkused ja piirangud

- Testid eeldavad, et loginuvormis on väljad:
  - `#login` (kasutajanimi),
  - `#password` (parool),
  - ning loginunupp on `input[type="submit"][value="Logi sisse"]`.

- Adminivaates eeldatakse, et lehe ülaosas kuvatakse `Tere, admin!`.  
  Kui rakenduse tekst hiljem muudetakse (nt `Tere, administraator!`), siis vastav test tuleb uuendada.

- Rakendus jookseb reaalsel serveril, mitte lokaalselt.  
  See tähendab, et testid räägivad elava andmebaasiga.  
  Sellepärast testid EI tee tegelikku `Lisa kaup` ega `Kustuta` tegevust (see rikuks andmeid ja muudaks järgmiste testide tulemust).

- Kui PowerShell Windowsis blokib `npm` või `npx` (ExecutionPolicy / allkirjastamata skriptid), siis alati võib kasutada cmd-vormi:
  ```bash
  cmd /c npx playwright test --ui
  ```

- Kui jooksutad:
  ```bash
  cmd /c npx playwright test
  ```
  siis Playwright loob automaatselt aruande kaustades:
  - `playwright-report/` – HTML raport kõikidest testidest,
  - `test-results/` – trace, screenshotid jms.
  Neid viiteid kasutatakse failis `REPORT.md`.
