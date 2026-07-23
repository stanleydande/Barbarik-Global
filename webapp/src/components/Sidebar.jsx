export default function Sidebar({ categories, activeCategory, onSelectCategory }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {categories.map((category) => (
            <li key={category} className={category === activeCategory ? 'active' : ''}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onSelectCategory(category)
                }}
              >
                {category}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
