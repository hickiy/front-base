const req = import.meta.glob('../../assets/svg/*.svg')

const re = /.*\/(.*)\.svg$/

const icons = Object.keys(req).map(i => {
  return i.match(re)[1]
})

export default icons