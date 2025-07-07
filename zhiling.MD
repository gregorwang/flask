---
title: Remix Quickstart
description: Learn how to use Clerk to quickly and easily add secure
  authentication and user management to your Remix application.
lastUpdated: 2025-06-26T18:29:56.000Z
---

<TutorialHero
  exampleRepo={[
    {
      title: "Remix Quickstart Repo",
      link: "https://github.com/clerk/clerk-remix-quickstart"

    }
  ]}
  beforeYouStart={[
    {
      title: "Set up a Clerk application",
      link: "/docs/quickstarts/setup-clerk",
      icon: "clerk",
    },
    {
      title: "Create a Remix application",
      link: "https://remix.run/docs/en/main/start/quickstart",
      icon: "remix",
    }
  ]}
/>

Learn how to use Clerk to quickly and easily add secure authentication and user management to your Remix app. This guide assumes that you are using Remix v2 or later.

> \[!NOTE]
> If you are using Remix SPA mode, follow the [Remix SPA mode guide](/docs/references/remix/spa-mode).

<Steps>
  ## Install `@clerk/remix`

  The [Clerk Remix SDK](/docs/references/remix/overview) gives you access to prebuilt components, hooks, and helpers to make user authentication easier.

  Run the following command to install the SDK:

  <CodeBlockTabs options={["npm", "yarn", "pnpm", "bun"]}>
    ```bash {{ filename: 'terminal' }}
    npm install @clerk/remix
    ```

    ```bash {{ filename: 'terminal' }}
    yarn add @clerk/remix
    ```

    ```bash {{ filename: 'terminal' }}
    pnpm add @clerk/remix
    ```

    ```bash {{ filename: 'terminal' }}
    bun add @clerk/remix
    ```
  </CodeBlockTabs>

  ## Set your Clerk API keys

  <SignedIn>
    Add the following keys to your `.env` file. These keys can always be retrieved from the [**API keys**](https://dashboard.clerk.com/last-active?path=api-keys) page in the Clerk Dashboard.
  </SignedIn>

  <SignedOut>
    1. In the Clerk Dashboard, navigate to the [**API keys**](https://dashboard.clerk.com/last-active?path=api-keys) page.
    2. In the **Quick Copy** section, copy your Clerk Publishable and Secret Keys.
    3. Paste your keys into your `.env` file.

    The final result should resemble the following:
  </SignedOut>

  ```env {{ filename: '.env' }}
  CLERK_PUBLISHABLE_KEY={{pub_key}}
  CLERK_SECRET_KEY={{secret}}
  ```

  ## Configure `rootAuthLoader()`

  The [`rootAuthLoader()`](/docs/references/remix/root-auth-loader) function is a helper function that provides the authentication state to your Remix application. You must export `rootAuthLoader()` as the root `loader()` function.

  Update your `root.tsx` file with the following code:

  ```tsx {{ filename: 'app/root.tsx', mark: [1, [4, 5], [15, 16]] }}
  import type { MetaFunction, LoaderFunction } from '@remix-run/node'
  import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'

  // Import `rootAuthLoader()`
  import { rootAuthLoader } from '@clerk/remix/ssr.server'

  export const meta: MetaFunction = () => [
    {
      charset: 'utf-8',
      title: 'New Remix App',
      viewport: 'width=device-width,initial-scale=1',
    },
  ]

  // Export `rootAuthLoader()` as the root route `loader`
  export const loader: LoaderFunction = (args) => rootAuthLoader(args)

  export function Layout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    )
  }

  export default function App() {
    return <Outlet />
  }
  ```

  ## Configure `ClerkApp`

  Clerk provides a `ClerkApp` wrapper to provide the authentication state to your React tree. This helper works with Remix SSR out-of-the-box and follows the "higher-order component" paradigm.

  Update your `root.tsx` file with the following code:

  ```tsx {{ filename: 'app/root.tsx', mark: [[6, 7], [39, 40]] }}
  import type { MetaFunction, LoaderFunction } from '@remix-run/node'

  import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'

  import { rootAuthLoader } from '@clerk/remix/ssr.server'
  // Import ClerkApp
  import { ClerkApp } from '@clerk/remix'

  export const meta: MetaFunction = () => [
    {
      charset: 'utf-8',
      title: 'New Remix App',
      viewport: 'width=device-width,initial-scale=1',
    },
  ]

  export const loader: LoaderFunction = (args) => rootAuthLoader(args)

  export function Layout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    )
  }

  function App() {
    return <Outlet />
  }

  // Wrap your app with `ClerkApp`
  export default ClerkApp(App)
  ```

  ## Protect your pages

  ### Client-side

  To protect your pages on the client-side, Clerk's [prebuilt control components](/docs/components/overview#control-components) control the visibility of content based on the user's authentication state.

  The following example uses the following components:

  * [`<SignedIn>`](/docs/components/control/signed-in): Children of this component can only be seen while **signed in**.
  * [`<SignedOut>`](/docs/components/control/signed-out): Children of this component can only be seen while **signed out**.
  * [`<UserButton />`](/docs/components/user/user-button): Shows the signed-in user's avatar. Selecting it opens a dropdown menu with account management options.
  * [`<SignInButton />`](/docs/components/unstyled/sign-in-button): An unstyled component that links to the sign-in page. In this example, since no props or [environment variables](/docs/deployments/clerk-environment-variables) are set for the sign-in URL, this component links to the [Account Portal sign-in page](/docs/account-portal/overview#sign-in).

  ```tsx {{ filename: 'routes/_index.tsx' }}
  import {
    SignInButton,
    SignOutButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/remix'

  export default function Index() {
    return (
      <div>
        <h1>Index Route</h1>
        <SignedIn>
          <p>You are signed in!</p>

          <UserButton />
        </SignedIn>
        <SignedOut>
          <p>You are signed out</p>

          <SignInButton />
        </SignedOut>
      </div>
    )
  }
  ```

  ### Server-side

  To protect your routes, use the [`getAuth()`](/docs/references/nextjs/get-auth) function in your loader. This function retrieves the authentication state from the request object, returning an [`Auth`](/docs/references/backend/types/auth-object) object that includes the `userId`, allowing you to determine if the user is authenticated.

  ```tsx {{ filename: 'routes/_index.tsx' }}
  import { UserButton } from '@clerk/remix'
  import { getAuth } from '@clerk/remix/ssr.server'
  import { LoaderFunction, redirect } from '@remix-run/node'

  export const loader: LoaderFunction = async (args) => {
    const { userId } = await getAuth(args)
    if (!userId) {
      return redirect('/sign-in')
    }
    return {}
  }

  export default function Index() {
    return (
      <div>
        <h1>Index route</h1>
        <p>You are signed in!</p>
        <UserButton />
      </div>
    )
  }
  ```

  ## Create your first user

  Run your project with the following command:

  <CodeBlockTabs options={["npm", "yarn", "pnpm", "bun"]}>
    ```bash {{ filename: 'terminal' }}
    npm run dev
    ```

    ```bash {{ filename: 'terminal' }}
    yarn dev
    ```

    ```bash {{ filename: 'terminal' }}
    pnpm dev
    ```

    ```bash {{ filename: 'terminal' }}
    bun dev
    ```
  </CodeBlockTabs>

  Visit your app's homepage at [`http://localhost:5173`](http://localhost:5173). Sign up to create your first user.
</Steps>

## Next steps

<Cards>
  * [Create a custom sign-in-or-up page](/docs/references/remix/custom-sign-in-or-up-page)
  * Learn how add custom sign-in-or-up page with Clerk components.

  ***

  * [Read user and session data](/docs/references/remix/read-session-data)
  * Learn how to use Clerk's hooks and helpers to access the active session and user data in your Remix app.

  ***

  * [Customization & localization](/docs/customization/overview)
  * Learn how to customize and localize the Clerk components.

  ***

  * [Clerk components](/docs/components/overview)
  * Learn more about the prebuilt components.
</Cards>
---
title: Build your own sign-in-or-up page for your Remix app with Clerk
description: Learn how to add a custom sign-in-or-up page to your Remix app with
  Clerk's prebuilt components.
lastUpdated: 2025-06-26T18:29:56.000Z
---

This guide shows you how to use the [`<SignIn />`](/docs/components/authentication/sign-in) component to build a custom page **that allows users to sign in or sign up within a single flow**.

To set up separate sign-in and sign-up pages, follow this guide, and then follow the [custom sign-up page guide](/docs/references/remix/custom-sign-up-page).

> \[!NOTE]
> Just getting started with Clerk and Remix? See the [quickstart tutorial](/docs/quickstarts/remix)!

<Steps>
  ## Build a sign-in-or-up page

  The following example demonstrates how to render the [`<SignIn />`](/docs/components/authentication/sign-in) component on a dedicated page using the [Remix optional route](https://reactrouter.com/en/main/route/route#optional-segments).

  ```tsx {{ filename: 'app/routes/sign-in.$.tsx' }}
  import { SignIn } from '@clerk/remix'

  export default function Page() {
    return <SignIn />
  }
  ```

  ## Configure your sign-in-or-up page

  <Tabs items={["SSR Mode", "SPA Mode"]}>
    <Tab>
      * Set the `CLERK_SIGN_IN_URL` environment variable to tell Clerk where the `<SignIn />` component is being hosted.
      * Set `CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` as a fallback URL incase users visit the `/sign-in` route directly.
      * Set `CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` as a fallback URL incase users select the 'Don't have an account? Sign up' link at the bottom of the component.

      Learn more about these environment variables and how to customize Clerk's redirect behavior in the [dedicated guide](/docs/guides/custom-redirects).

      ```env {{ filename: '.env' }}
      CLERK_SIGN_IN_URL=/sign-in
      CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
      CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
      ```
    </Tab>

    <Tab>
      * Set the `signInUrl` property to your `ClerkApp` options to tell Clerk where the `<SignIn />` component is being hosted.
      * Set the `signInFallbackRedirectUrl` property to a fallback URL incase users visit the `/sign-in` route directly.
      * Set the `signUpFallbackRedirectUrl` property to a fallback URL incase users select the 'Don't have an account? Sign up' link at the bottom of the component.

      Learn more about these environment variables and how to customize Clerk's redirect behavior in the [dedicated guide](/docs/guides/custom-redirects).

      ```ts {{ filename: 'app/root.tsx', mark: [[3, 4]] }}
      export default ClerkApp(App, {
        publishableKey: PUBLISHABLE_KEY,
        signInUrl: '/sign-in',
        signInFallbackRedirectUrl: '/',
        signUpFallbackRedirectUrl: '/',
      })
      ```
    </Tab>
  </Tabs>

  ## Visit your new page

  Run your project with the following terminal command from the root directory of your project:

  <CodeBlockTabs options={["npm", "yarn", "pnpm", "bun"]}>
    ```bash {{ filename: 'terminal' }}
    npm run dev
    ```

    ```bash {{ filename: 'terminal' }}
    yarn dev
    ```

    ```bash {{ filename: 'terminal' }}
    pnpm dev
    ```

    ```bash {{ filename: 'terminal' }}
    bun dev
    ```
  </CodeBlockTabs>

  Visit your new custom page locally at [localhost:3000/sign-in](http://localhost:3000/sign-in).
</Steps>

## Next steps

<Cards>
  * [Custom sign-up page](/docs/references/remix/custom-sign-up-page)
  * Learn how to add a custom sign-up page to your Remix app with Clerk's prebuilt components.

  ***

  * [Read user and session data](/docs/references/remix/read-session-data)
  * Learn how to use Clerk's hooks and helpers to access the active session and user data in your Remix application.
</Cards>
---
title: Read session and user data in your Remix app with Clerk
description: Learn how to use Clerk's hooks and helpers to access the active
  session and user data in your Remix application.
lastUpdated: 2025-06-26T18:29:56.000Z
---

Clerk provides a set of [hooks and helpers](/docs/references/remix/overview) that you can use to access the active session and user data in your Remix application. Here are examples of how to use these helpers in both the client and server-side to get you started.

## Server-side

### `getAuth()`

The [`getAuth()`](/docs/references/remix/overview#get-auth) helper allows you to access the [`Auth` object](/docs/references/backend/types/auth-object){{ target: '_blank' }}, which includes the current user's `userId`. You can use the `userId` to protect your routes or get the user's data.

In the following example, the `userId` is passed to the Backend SDK's [`getUser()`](/docs/references/backend/user/get-user){{ target: '_blank' }} method to get the user's full `User` object. For information on how to use the Backend SDK, see the [Backend SDK documentation](/docs/references/backend/overview){{ target: '_blank' }}.

<Tabs items={["Loader Function", "Action Function"]}>
  <Tab>
    ```tsx {{ filename: 'routes/profile.tsx' }}
    import { LoaderFunction, redirect } from '@remix-run/node'
    import { getAuth } from '@clerk/remix/ssr.server'
    import { createClerkClient } from '@clerk/remix/api.server'

    export const loader: LoaderFunction = async (args) => {
      // Use `getAuth()` to retrieve the user's ID
      const { userId } = await getAuth(args)

      // If there is no userId, then redirect to sign-in route
      if (!userId) {
        return redirect('/sign-in?redirect_url=' + args.request.url)
      }

      // Initialize the Backend SDK and get the user's full `Backend User` object
      const user = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(
        userId,
      )

      // Return the retrieved user data
      return { serialisedUser: JSON.stringify(user) }
    }
    ```
  </Tab>

  <Tab>
    ```tsx {{ filename: 'routes/profile.tsx' }}
    import { ActionFunction, redirect } from '@remix-run/node'
    import { getAuth } from '@clerk/remix/ssr.server'
    import { createClerkClient } from '@clerk/remix/api.server'

    export const action: ActionFunction = async (args) => {
      // Use `getAuth()` to retrieve the user's ID
      const { userId } = await getAuth(args)

      // If there is no userId, then redirect to sign-in route
      if (!userId) {
        return redirect('/sign-in?redirect_url=' + args.request.url)
      }

      // Initialize the Backend SDK and get the user's full `Backend User` object
      const updatedUser = await createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      }).users.getUser(userId)

      // Return the retrieved user data
      return { serialisedUser: JSON.stringify(updatedUser) }
    }
    ```
  </Tab>
</Tabs>

## Client Side

### `useAuth()`

The following example uses the [`useAuth()`](/docs/hooks/use-auth) hook to access the current auth state, as well as helper methods to manage the current active session.

```tsx {{ filename: 'example.tsx' }}
export default function Example() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()

  const fetchExternalData = async () => {
    // Use `getToken()` to get the current user's session token
    const token = await getToken()

    // Use `token` to fetch data from an external API
    const response = await fetch('https://api.example.com/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.json()
  }

  // Use `isLoaded` to check if Clerk is loaded
  if (!isLoaded) {
    return <div>Loading...</div>
  }

  // Use `isSignedIn` to check if the user is signed in
  if (!isSignedIn) {
    // You could also add a redirect to the sign-in page here
    return <div>Sign in to view this page</div>
  }

  return (
    <div>
      Hello, {userId}! Your current active session is {sessionId}.
    </div>
  )
}
```

{/* TODO: Keep in sync with /tanstack-react-start/read-session-data and /expo/read-session-user-data */}

### `useUser()`

The following example uses the [`useUser()`](/docs/hooks/use-user) hook to access the [`User`](/docs/references/javascript/user) object, which contains the current user's data such as their full name. The `isLoaded` and `isSignedIn` properties are used to handle the loading state and to check if the user is signed in, respectively.

```tsx {{ filename: 'src/Example.tsx' }}
export default function Example() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>
  }

  return <div>Hello {user.firstName}!</div>
}
```

{/* TODO: Keep in sync with /references/tanstack-react-start/read-session-data and /references/expo/read-session-user-data */}


