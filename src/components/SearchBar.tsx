import { Search } from 'lucide-react'
import styles from '../styles/App.module.css'

export const SearchBar = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <label className={styles.searchBar}>
    <Search size={20} />
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="What do you want to play?" autoFocus />
  </label>
)
