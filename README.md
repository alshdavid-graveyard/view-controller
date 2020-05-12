# View Controller for React

Take advantage of Vue's automatic re-rendering in React

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { ViewController } from 'react-view-controller'

@ViewController()
class App extends React.Component {
  private list: string[] = []

  add() {
    this.list.push('Item')
  }

  render() {
    return <div>
      <button onClick={() => this.add()}>
        Add
      </button>
      <section>
        {this.list.map(item => <div>{item}</div>)}
      </section>
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('outlet'))
```

React to changes in objects coming from context

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { ViewController } from 'react-view-controller'

export const ItemListContext = React.createContext()

class ItemList {
  data: string[] = []

  add() {
    this.data.push('Update')
  }
}

@ViewController()
class Main extends React.Component<any> {
  @Context(ItemListContext)
  private itemList!: ItemList

  render() {
    return <div>
      <button onClick={() => this.itemList.add()}>
        Add
      </button>
      <section>
        {this.itemList.data.map(item => <div>{item}</div>)}
      </section>
    </div>
  }
}

const itemList = new ItemList()

const App = () => (
  <ItemListContext.Provider value={itemList}>
    <Main />
  </ItemListContext.Provider>
)

ReactDOM.render(<App />, document.getElementById('outlet'))
```