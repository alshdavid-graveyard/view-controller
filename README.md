# view-controller

```typescript
import React from 'react'
import ReactDOM from 'react-dom'
import { ViewController, Context } from '~/platform/reaction-wheel'

export const MyContext = React.createContext<any>({})

const state = {
  list: []
}

@ViewController()
class Main extends React.Component<any> {
  @Context(MyContext, ctx => ctx.list) 
  private list!: string[]

  render() {
    return <div>
      <button 
        onClick={() => this.list.push('hi')}>
        Hi
      </button>
      <button 
        onClick={() => this.list.pop()}>
        Bye
      </button>
      {this.list.map((item, i) => 
        <div key={i}>{item}</div>)}
    </div>
  }
}

const App = () => (
  <MyContext.Provider value={state}>
    <Main />
  </MyContext.Provider>
)

ReactDOM.render(<App />, document.getElementById('outlet'))
```