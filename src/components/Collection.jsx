import { useState, useEffect } from 'react';

function Collection() {
  const [collection, setCollection] = useState(() => {
    const savedCollection = localStorage.getItem('mtgCollection');
    return savedCollection ? JSON.parse(savedCollection) : [];
  });

  useEffect(() => {
    localStorage.setItem('mtgCollection', JSON.stringify(collection));
  }, [collection]);

  return (
    <div>
      {/* Your collection rendering code here */}
    </div>
  );
}

export default Collection;
