import { test, expect, type Page } from "@playwright/test";

// Chiave usata dall'app per persistere gli ordini (lib/storage.ts).
const STORAGE_KEY = "order-tracker:orders:v1";

// Compila il form e invia un ordine.
async function addOrder(
  page: Page,
  customer: string,
  product: string,
  quantity: number | string = 1,
  status?: string
) {
  await page.getByTestId("input-customer").fill(customer);
  await page.getByTestId("input-product").fill(product);
  await page.getByTestId("input-quantity").fill(String(quantity));
  if (status) {
    await page.getByTestId("select-status").selectOption(status);
  }
  await page.getByTestId("submit-order").click();
}

// Ogni test parte da localStorage pulito.
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("mostra lo stato vuoto iniziale", async ({ page }) => {
  await expect(
    page.getByText("Nessun ordine. Aggiungine uno qui sopra.")
  ).toBeVisible();
  await expect(page.getByTestId("order-row")).toHaveCount(0);
});

test("aggiunge un ordine", async ({ page }) => {
  await addOrder(page, "Mario Rossi", "Scarpe da ginnastica", 3, "shipped");

  await expect(page.getByTestId("order-row")).toHaveCount(1);
  await expect(page.getByTestId("order-customer")).toHaveText("Mario Rossi");
  await expect(page.getByTestId("order-product")).toHaveText(
    "Scarpe da ginnastica"
  );
  await expect(page.getByTestId("order-quantity")).toHaveText("3");
  await expect(page.getByTestId("count-total")).toHaveText("1");
});

test("valida i campi obbligatori", async ({ page }) => {
  // Invio a vuoto: cliente e prodotto obbligatori, nessuna riga creata.
  await page.getByTestId("submit-order").click();

  await expect(page.getByTestId("error-customer")).toBeVisible();
  await expect(page.getByTestId("error-product")).toBeVisible();
  await expect(page.getByTestId("order-row")).toHaveCount(0);

  // Quantità fuori intervallo -> errore quantità.
  await page.getByTestId("input-customer").fill("Mario Rossi");
  await page.getByTestId("input-product").fill("Scarpe");

  await page.getByTestId("input-quantity").fill("0");
  await page.getByTestId("submit-order").click();
  await expect(page.getByTestId("error-quantity")).toBeVisible();
  await expect(page.getByTestId("order-row")).toHaveCount(0);

  await page.getByTestId("input-quantity").fill("1000");
  await page.getByTestId("submit-order").click();
  await expect(page.getByTestId("error-quantity")).toBeVisible();
  await expect(page.getByTestId("order-row")).toHaveCount(0);
});

test("filtra per stato", async ({ page }) => {
  await addOrder(page, "Cliente Pending", "Prodotto 1", 1, "pending");
  await addOrder(page, "Cliente Processing", "Prodotto 2", 1, "processing");
  await addOrder(page, "Cliente Shipped", "Prodotto 3", 1, "shipped");

  await expect(page.getByTestId("order-row")).toHaveCount(3);

  await page.getByTestId("filter-shipped").click();
  await expect(page.getByTestId("order-row")).toHaveCount(1);
  await expect(page.getByTestId("order-customer")).toHaveText("Cliente Shipped");

  await page.getByTestId("filter-delivered").click();
  await expect(page.getByTestId("order-row")).toHaveCount(0);
  await expect(
    page.getByText("Nessun ordine con questo stato.")
  ).toBeVisible();

  await page.getByTestId("filter-pending").click();
  await expect(page.getByTestId("order-row")).toHaveCount(1);
  await expect(page.getByTestId("order-customer")).toHaveText("Cliente Pending");
});

test("cambia stato da una riga", async ({ page }) => {
  await addOrder(page, "Mario Rossi", "Scarpe", 1, "pending");
  await expect(page.getByTestId("order-status")).toHaveText("In attesa");

  await page.getByTestId("order-status-select").selectOption("shipped");
  await expect(page.getByTestId("order-status")).toHaveText("Spedito");
});

test("elimina un ordine", async ({ page }) => {
  await addOrder(page, "Mario Rossi", "Scarpe", 1);
  await expect(page.getByTestId("order-row")).toHaveCount(1);

  await page.getByTestId("order-delete").click();
  await expect(page.getByTestId("order-row")).toHaveCount(0);
  await expect(
    page.getByText("Nessun ordine. Aggiungine uno qui sopra.")
  ).toBeVisible();
});

test("persiste dopo il reload", async ({ page }) => {
  await addOrder(page, "Mario Rossi", "Scarpe", 2);
  await addOrder(page, "Luigi Verdi", "Cappello", 1);
  await expect(page.getByTestId("order-row")).toHaveCount(2);

  // Verifica che i dati siano davvero in localStorage.
  const stored = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY
  );
  expect(stored).toContain("Mario Rossi");

  await page.reload();

  await expect(page.getByTestId("order-row")).toHaveCount(2);
  await expect(
    page.getByTestId("order-customer").getByText("Mario Rossi")
  ).toBeVisible();
  await expect(
    page.getByTestId("order-customer").getByText("Luigi Verdi")
  ).toBeVisible();
});
