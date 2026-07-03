

## Vilken ny AI-teknik/bibliotek identifierade ni och hur tillämpade ni det?

Vi började med att testa olika AI-tekniker och fann att lovable gav den absolut bästa grunden för ett projekt, ett snyggt frontend som fungerade. Detta var i stor kontrast till gemini CLI, chatgpt och andra tekniker. Lovable kunde använda sig av Gemini på ett sätt som vi inte bemästrade, vilket gjorde Lovable till en ganska självklart och mycket användbar metod. Sedan implementerade vi allt i VScode och för att fixa till en backend samt städa upp resterande kod så använde vi oss av Co-pilot (claude). Gällande just backend-delen så valde vi att köra med python + Flask. Detta då vi ville få en större inblick i Python som språk, men också i en eventuell omständighet där man kanske skulle behöva ge sig in i ett annat språk och hur användningen av AI då kan användas till att underlätta och effektivisera.

## Motivera varför ni valde den AI-tekniken/det biblioteket.

Vi började med att diskutera vilken AI vi skulle använda och kom fram till att vi behövde testa runt. Vi tog 3-4 dagar att undersöka på egen hand och flera kom fram till att lovable inom webbutveckling kunde generera ett projekt i helhet. Lovabels inbyggda prompting var kompletterande för våran bristande AI-prompting kunskap.

Projektet använder även gemini som bibliotek som returnerade AI-genererade recept med Ai-generarade bilder baserat på ingredienserna som skrivits i input, men detta var inte ett direkt val av oss utan lovables beslut baserad på våran prompt.

## Varför behövdes AI-komponenten? Skulle ni kunna löst det på ett annat sätt?

Baserat på hur frågan är ställd så är det svårt att ge ett tydligt rakt svar. Allt är relativt till hur man ser på det. Med andra ord så går detta projekt att göra utan AI. Men först och främst så skulle effektivitet och kvaliten försämras. Men sedan skulle också variationen och träffsäkerheten minska.

AI-komponent ger en enkel lösning för att få fram recept samt bild till rätten och kan även komma fram med nya recept som inkluderar alla förfrågade ingredienser. Utan AI skulle detta varit en krävande hämtning från en databas som skulle behöva innehålla miljontals recept för att imitera vårat slutresultat. På detta sätt garanterar vi att användaren alltid får ett resultat, skräddarsytt eller redan existerande. Det går som sagt att lösa på annat sätt men det finns risk att det inte skulle garantera ett lika tillfredställande och snabbt resultat.

### Ytterliggare frågeställningar

Som tidigare nämnt har vi angett att tillämpningen av AI i vårat projekt varit väldigt nödvändigt. Genereringen av bilderna blir ett sätt att skapa bilder som matcher recept som kanske inte än finns. DVS att det lämnar inte en användare med någon "placeholder"-image utan de kan visuellt se måltiden framför sig. Detta är också ett sätt att undvika sökningen ett "stock"-bilder och därför också undvika eventuell licensproblematik.  Bilderna genereras parallellt istället för sekventiellt. Detta för snabb respons och för att undvika omkostnad vi upprepade anrop

Det finns också en guardrail som vi själva inte lagt in, men noterade, där vid förekomsten av obscena eller vulgära inputs i receptfältet så skippas generationen av både bilder och recept. Detta ger oss också möjlighet att på ett enkelt sätt justera detta och lägga eller prompta in eventuellt nya "säkerhetsbeteenden" utifrån behov.

I både **backend** (framtagen via Co-pilot/Claude) och **frontend** finns en inbyggd semantisk sökfunktion som använder *embeddings*.
Följande filer är involverade:

-  **Backend**
  - [`semantic_search_service.py`](backend/app/services/semantic_search_service.py)
  - [`recipe_service.py`](backend/app/services/recipe_service.py)  
    → Här får varje recept en vektorrepresentation genererad vid skapande.
  - [`recipes.py`](backend/app/routers/recipes.py)

-  **Frontend**
  - [`recipeAPI.ts`](src/lib/recipeAPI.ts)
  - [`SavedRecipes.tsx`](src/pages/SavedRecipes.tsx)

 Vi har också inkorporerat en funktion som innebär att du kan spara recept. Allt som avser detta, samt env-filer, är skapade av lovable i frontend och sedan via co-pilot (claude) i backend. För tillfället sparas allt lokalt, databas-koden finns men används inte. Vi har inte implementerat någon log-in funktion, dvs att vi inte sparar någon form av persondata. Detta känns säkrare, nu när AI skrivit allt, gällande risken för läckor av persondata. Detta är något man vill ha relativ kontroll över och kunna se över. Man kan absolut implementera detta via AI men i och med brist på tid och pga uppgiftens beskrivning så valde vi att lämna detta ute med insikten att vi inte ville att AI skulle sköta hela den biten.

