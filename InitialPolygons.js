const InitialPolygonList = (() => {
  function generateInitialPolygonList(configuration, width, height) {
    const { size, polygonTemplate, rotation, spacing } = configuration

    const polygon = polygonTemplate.map(point => point.rotate(rotation))

    const polygonList = []
    const dx = (size / 2) * spacing
    const dy = (size / 2) * spacing
    const midX = width / 2
    const midY = height / 2
    for (x = 0; x <= width / 2 + size; x += dx) {
      for (y = 0; y <= height / 2 + size; y += dy) {
        const polygon1 = translatePolygon(polygon, size, midX + x, midY + y)
        polygonList.push(polygon1)
        if (x > 0) {
          const polygon2 = translatePolygon(polygon, size, midX - x, midY + y)
          polygonList.push(polygon2)
        }
        if (y > 0) {
          const polygon3 = translatePolygon(polygon, size, midX + x, midY - y)
          polygonList.push(polygon3)
        }
        if (x > 0 && y > 0) {
          const polygon4 = translatePolygon(polygon, size, midX - x, midY - y)
          polygonList.push(polygon4)
        }
      }
    }
    return polygonList
  }

  function translatePolygon(polygon, size, x, y) {
    const position = new Vector2(x, y)

    return polygon.map(point => point.scale(size / 2).add(position))
  }

  return {
    generateInitialPolygonList,
  }
})()
