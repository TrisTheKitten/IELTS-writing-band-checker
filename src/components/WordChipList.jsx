export function WordChipList({ items }) {
  if (!items.length) {
    return null;
  }

  return (
    <ul className="word-lookup__chips">
      {items.map((item) => (
        <li key={item} className="word-lookup__chip">
          {item}
        </li>
      ))}
    </ul>
  );
}
