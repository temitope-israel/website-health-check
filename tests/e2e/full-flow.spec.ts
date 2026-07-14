import { test, expect } from '@playwright/test';

test('full audit-to-report flow', async ({ page }) => {
  await page.goto('/');

  await page
    .getByPlaceholder('https://yourwebsite.com')
    .fill('https://example.com');
  await page.getByRole('button', { name: 'Run Free Diagnostic' }).click();

  await expect(page.getByText(/Good|Needs Work|Poor/).first()).toBeVisible({
    timeout: 30_000,
  });

  await page
    .getByPlaceholder('you@example.com')
    .fill(process.env.ADMIN_EMAIL ?? 'test@example.com');
  await page.getByRole('button', { name: 'Email Me the Report' }).click();

  await expect(page.getByText(/Report sent/)).toBeVisible({ timeout: 15_000 });
});

test('admin dashboard redirects to login when signed out', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('admin can log in and see the dashboard', async ({ page }) => {
  await page.goto('/admin/login');

  await page.getByPlaceholder('Email').fill(process.env.ADMIN_EMAIL!);
  await page.getByPlaceholder('Password').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('/admin');
  await expect(page.getByText('Captured Leads')).toBeVisible();
});
