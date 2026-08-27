# Wander Wallet

Create a mobile PWA for tracking travel expenses using React, Tailwind CSS, and shadcn/ui. The main screen is a trip dashboard. The UI must fully support English (EN) and Georgian (KA) with a toggle switch in the header. At the top of the dashboard, show the total spent amount '0 ₾' (GEL) alongside an empty pie chart for categories. Add two interactive currency conversion widgets (EUR to GEL and USD to GEL).

Below the dashboard, display an empty list for transactions (Expenses). The design must be clean, minimalistic, and iOS-styled. Add a Floating Action Button (FAB) for 'Add Expense / ხარჯის დამატება'. Clicking it opens a bottom sheet or modal with: an amount input, a currency dropdown (GEL, USD, EUR), and a category selector with icons. The categories are: Tickets/ბილეთები, Luggage/ბარგი, Hotel/სასტუმრო, Food/კვება, Internet/ინტერნეტი, Transport/ტრანსპორტი, Local Exp./ხარჯი ადგილზე.

Include functional logic: when adding an expense in EUR or USD, the app must automatically convert the amount to GEL using fixed mock exchange rates, append the transaction to the list, and update the total balance and pie chart. Place a bottom navigation tab bar with: Home, My Trips, Settings.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3176e982-8a2d-4b88-b6f5-a4cda421a367).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
