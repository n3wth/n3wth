import { withTheme } from '../components/withTheme'
import { Button } from '@n3wth/ui/primitives'
import { UtilityPage } from '../components/UtilityPage'

/* Post-logout landing page — listed in Auth0's Allowed Logout URLs so
   sign-outs without a client_id have somewhere calm to land. */
function Logout() {

  return (
    <UtilityPage label="Signed out" title="You’re signed out" description="Your session has ended. Close this tab, or head back in." actions={<>
      <Button label="Go home" variant="primary" href="/" />
      <Button label="Get support" variant="ghost" href="/support" />
    </>} />
  )
}

export default withTheme(Logout)
