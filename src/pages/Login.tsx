import { useState, type FormEvent } from 'react'
import { ListMusic, LockKeyhole, Mail } from 'lucide-react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthActions } from '../components/AuthActions'
import styles from '../styles/App.module.css'

export const Login = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isResetMode, setIsResetMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleToggleMode = () => {
    setIsResetMode((current) => !current)
    setPassword('')
    setConfirmPassword('')
    setErrorMessage('')
    setStatusMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setErrorMessage('')
    setStatusMessage('')

    if (isResetMode) {
      const result = await resetPassword({
        email,
        newPassword: password,
        confirmPassword,
      })

      if (!result.success) {
        setErrorMessage(result.message ?? 'Cap nhat mat khau that bai.')
        return
      }

      setConfirmPassword('')
      setIsResetMode(false)
      setStatusMessage(result.message ?? 'Da cap nhat mat khau moi. Hay dang nhap lai.')
      return
    }

    const result = await login({ email, password })
    if (!result.success) {
      setErrorMessage(result.message ?? 'Dang nhap that bai.')
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <section className={styles.authShell}>
      <div className={styles.authTopBar}>
        <AuthActions />
      </div>
      <div className={styles.authPanel}>
        <div className={styles.authBrand}>
          <span className={styles.authLogo}>
            <ListMusic size={22} />
          </span>
          <div>
            <p>{isResetMode ? 'Khoi phuc tai khoan' : 'Chao mung tro lai'}</p>
            <h1>{isResetMode ? 'Dat lai mat khau' : 'Dang nhap Localfy'}</h1>
          </div>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.authHint}>
            {isResetMode ? (
              <>
                <strong>Quen mat khau</strong>
                <span>Nhap email cua tai khoan, mat khau moi va xac nhan mat khau moi.</span>
                <span>Thong tin se duoc cap nhat truc tiep vao bo du lieu nguoi dung.</span>
              </>
            ) : (
              <>
                <strong>Tai khoan demo</strong>
                <span>Email: admin@localfy.app</span>
                <span>Mat khau: Localfy123</span>
              </>
            )}
          </div>

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

          {isResetMode ? (
            <>
              <label className={styles.authField}>
                <span>Mat khau moi</span>
                <div>
                  <LockKeyhole size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhap mat khau moi"
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <label className={styles.authField}>
                <span>Xac nhan mat khau moi</span>
                <div>
                  <LockKeyhole size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Nhap lai mat khau moi"
                    autoComplete="new-password"
                  />
                </div>
              </label>
            </>
          ) : (
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
          )}

          <div className={styles.authMeta}>
            <button className={styles.authTextButton} type="button" onClick={handleToggleMode}>
              {isResetMode ? 'Quay lai dang nhap' : 'Quen mat khau?'}
            </button>
          </div>

          {statusMessage ? <p className={styles.authSuccess}>{statusMessage}</p> : null}
          {errorMessage ? <p className={styles.authError}>{errorMessage}</p> : null}

          <button className={styles.authSubmit} type="submit">
            {isResetMode ? 'Luu mat khau moi' : 'Dang nhap'}
          </button>
        </form>
      </div>
    </section>
  )
}
