// import ForgotPassword from '@/components/auth/forgotPassword'

// const ForgotPasswordPage = () => {
//   return <ForgotPassword/>
// }

// export default ForgotPasswordPage

import Forgotpassword from '@/components/auth/forgotPassword'


const ForgotPasswordPage = () => {
  const router = useRouter()
  const { token } = router.query

  return <Forgotpassword params={{ token }} />
}

export default ForgotPasswordPage
