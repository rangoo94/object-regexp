/**
 * Class which represents node
 */
class Node {
  /**
   * @param {string} type
   * @param {Node[]} [children]
   * @param {object} [data]
   */
  constructor (type, children, data) {
    this.type = type
    this.children = children || []
    this.data = Object.assign({}, data) || {}
  }

  /**
   * Set data value
   *
   * @param {string} name
   * @param {*} [value]
   */
  set (name, value) {
    this.data[name] = value
  }

  /**
   * Get last children in list
   *
   * @returns {Node|null}
   */
  getLastChildren () {
    return this.children[this.children.length - 1] || null
  }

  /**
   * Replace last children
   *
   * @param {Node} node
   */
  replaceLastChildren (node) {
    if (!this.children.length) {
      throw new Error('Replacing not existing children')
    }

    this.children[this.children.length - 1] = node
  }

  /**
   * Walk through nodes
   *
   * @param {function} func
   * @param {Node} [parentNode]
   * @param {int} [index]
   */
  walk (func, parentNode, index) {
    func(this, parentNode, index)

    // Iterate over children
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].walk(func, this, i)
    }
  }

  /**
   * Walk through nodes from end to beginning
   *
   * @param {function} func
   * @param {Node} [parentNode]
   * @param {int} [index]
   */
  walkBack (func, parentNode, index) {
    func(this, parentNode, index)

    // Iterate over children
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].walkBack(func, this, i)
    }
  }

  /**
   * Walk through nodes from end to beginning (firing current node at end)
   *
   * @param {function} func
   * @param {Node} [parentNode]
   * @param {int} [index]
   */
  walkBackEnd (func, parentNode, index) {
    // Iterate over children
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].walkBack(func, this, i)
    }

    func(this, parentNode, index)
  }

  clone () {
    return new Node(this.type, this.children.map(x => x.clone()), this.data)
  }
}

module.exports = Node
