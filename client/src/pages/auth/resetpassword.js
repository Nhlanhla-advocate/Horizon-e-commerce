import ResetPassword from '@/components/auth/ResetPassword'
import { useRouter } from 'next/router'

const ResetPasswordPage = () => {
  const router = useRouter()
  const { token } = router.query

  return <ResetPassword params={{ token }} />
}

export default ResetPasswordPage 