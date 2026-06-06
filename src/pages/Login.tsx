import { useState, type FormEvent } from 'react'
import { ListMusic, LockKeyhole, Mail } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/App.module.css'

export const Login = () => {
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = login({ email, password })
    if (!result.success) {
      setErrorMessage(result.message ?? 'Dang nhap that bai.')
      return
    }

    setErrorMessage('')
  }

  return (
    <section className={styles.authShell}>
      <div className={styles.authPanel}>
        <div className={styles.authBrand}>
          <span className={styles.authLogo}>
            <ListMusic size={22} />
          </span>
          <div>
            <p>Chao mung tro lai</p>
            <h1>Dang nhap Localfy</h1>
          </div>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <label className={styles.authField}>
            <span>Email</span>
            <div>
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ban@example.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label className={styles.authField}>
            <span>Mat khau</span>
            <div>
              <LockKeyhole size={16} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhap mat khau"
                autoComplete="current-password"
              />
            </div>
          </label>

          {errorMessage ? <p className={styles.authError}>{errorMessage}</p> : null}

          <button className={styles.authSubmit} type="submit">
            Dang nhap
          </button>
        </form>
      </div>
    </section>
  )
}
