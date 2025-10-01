# Campo `residence` - Persistenza nel Database

## Problema Risolto

La residenza selezionata dall'utente durante la registrazione veniva salvata solo in localStorage, il che faceva sì che venisse persa al ricaricare la pagina o cambiare dispositivo.

## Modifiche Implementate

### 1. Schema del Database (Prisma)

**File:** `prisma/schema.prisma`

```prisma
model User {
  // ... altri campi
  residence        String? // Residenza scelta dall'utente (es. 'ONE' o 'AMBRO')
  // ... altri campi
}
```

- ✅ Campo `residence` decommentato nel modello User
- ✅ Applicato con `npx prisma db push`

### 2. Frontend - Form di Registrazione

**File:** `src/app/registro/page.tsx`

```typescript
const payload = {
  // ... altri campi
  residence: formData.residence || null, // Includi la residenza selezionata
  // ... altri campi
};
```

- ✅ Aggiunto `residence` al payload inviato all'API
- ✅ Il valore selezionato viene inviato dal form di registrazione

### 3. Backend - API di Registrazione

**File:** `src/app/api/auth/register/route.ts`

```typescript
// Destructuring dei dati ricevuti
const { 
  // ... altri campi
  residence,
  // ... altri campi
} = await request.json();

// Salvataggio nel database
if (residence) userData.residence = residence; // Salva la residenza selezionata
```

- ✅ Riceve il campo `residence` dal frontend
- ✅ Lo salva nel database durante la registrazione

### 4. Backend - API Utente

**File:** `src/app/api/user/by-email/route.ts`

```typescript
const userProfile = {
  // ... altri campi
  residence: (user as any).residence ?? null, // Includi la residenza dal database
  // ... altri campi
};
```

- ✅ Include il campo `residence` quando restituisce i dati dell'utente
- ✅ Viene ottenuto direttamente dal database

## Flusso Completo

### Registrazione Utente
1. L'utente seleziona una residenza nel form
2. Il frontend invia `residence` nel payload all'API
3. Il backend salva `residence` nella tabella User
4. L'utente risulta registrato con la residenza persistente

### Caricamento Utente (Login/Refresh)
1. AuthContext richiede i dati utente tramite `/api/user/by-email`
2. L'API interroga il database includendo il campo `residence`
3. Il frontend riceve i dati utente completi
4. La residenza rimane disponibile senza dipendere da localStorage

## Benefici

✅ **Persistenza reale**: la residenza viene salvata nel database
✅ **Sincronizzazione multi-dispositivo**: disponibile su qualsiasi dispositivo
✅ **Recupero dopo refresh**: non si perde al ricaricare la pagina
✅ **Coerenza dei dati**: dati consistenti e affidabili
✅ **Compatibilità**: funziona con gli utenti esistenti (null di default)

## Compatibilità con gli Utenti Esistenti

- Gli utenti registrati prima di questa modifica avranno `residence: null`
- Potranno aggiornare la loro residenza tramite il profilo (funzionalità futura)
- Non è richiesta una migrazione dei dati esistenti

## Testing

Il campo è stato testato con successo:
- ✅ Campo aggiunto al database
- ✅ Scrittura e lettura funzionanti correttamente
- ✅ Compatibile con gli utenti esistenti
- ✅ API aggiornate e funzionanti

## Prossimi Passi

Per completare la funzionalità, si potrebbe considerare:
- [ ] Aggiungere l'opzione per modificare la residenza nel profilo utente
- [ ] Validazione dei valori consentiti per `residence`
- [ ] Migrazione dei dati da localStorage al database per gli utenti esistenti
