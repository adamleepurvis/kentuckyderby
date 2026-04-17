import { LoginForm } from './LoginForm'

export default function AdminLoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <LoginForm />
      </div>
    </div>
  )
}
