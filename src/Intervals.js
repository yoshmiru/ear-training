import React, { Component } from 'react';
import { Button, Col, Row } from 'reactstrap';
import scriptLoader from 'react-async-script-loader'

class SelectInterval extends Component {
  render() {
    return (<select onChange={this.props.onChange}>
        <option value="simple">シンプル</option>
        <option value="diatonic">ダイアトニック</option>
        <option value="all">全て</option>
        </select>)
  }
}

class SelectOrder extends Component {
  render() {
    return (<select  onChange={this.props.onChange}>
          <option value="asc">昇順</option>
          <option value="desc">降順</option>
          <option value="random">ランダム</option>
        </select>)
  }
}

class Intervals extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initialized: false,
      interval: 'simple',
      order: 'asc',
      onPlayBtnClick: () => {
      },
      answerBtns: (<div></div>),
    }
  }

  render() {
    const ctx = this
    const intervals = (<SelectInterval onChange={(e) => {
      ctx.setState({
        interval: e.target.value,
      })
      ctx.setState({onPlayBtnClick: () => { play(window.MIDI, ctx) }})
    }}/>)
    const orders = (<SelectOrder onChange={(e) => {
      ctx.setState({
        order: e.target.value,
      })
      ctx.setState({onPlayBtnClick: () => { play(window.MIDI, ctx) }})
    }}/>)
    const btn = (<Button color='primary' onClick={ctx.state.onPlayBtnClick}
      className={(ctx.state.initialized ? 'btnActive' : 'btnInactive')} >
      Play
      </Button>)
    return (
      <div>
      <Row>
      <Col sm='2'>
        {intervals}
      </Col>
      <Col sm='2'>
        {orders}
      </Col>
      <Col sm='2'>
        {btn}
      </Col>
      </Row>
      <Row>
        <Col>
        {ctx.state.answerBtns}
        </Col>
      </Row>
      </div>
    )
  }

  componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed }) {
    if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished
      if (isScriptLoadSucceed) {
        //console.log(window.MIDI)
        const {MIDI} = window
        initializeMidi(MIDI, this)
      } else {
        alert('Error')
      }
    }
  }

  /*
  componentDidMount () {
    const { isScriptLoaded, isScriptLoadSucceed } = this.props
    if (isScriptLoaded && isScriptLoadSucceed) {
      //this.initEditor()
    } else {
      //alert('Error')
    }
  }
  */
}

export default scriptLoader(
  //<!-- polyfill -->
  "midi/inc/shim/Base64.js",
  "midi/inc/shim/Base64binary.js",
  "midi/inc/shim/WebAudioAPI.js",
  //<!-- midi.js package -->
  "midi/js/midi/audioDetect.js",
  "midi/js/midi/gm.js",
  "midi/js/midi/loader.js",
  "midi/js/midi/plugin.audiotag.js",
  "midi/js/midi/plugin.webaudio.js",
  "midi/js/midi/plugin.webmidi.js",
  //<!-- utils -->
  "midi/js/util/dom_request_xhr.js",
  "midi/js/util/dom_request_script.js",
)(Intervals)

const initializeMidi = (MIDI, ctx) => {
  MIDI.loadPlugin({
    soundfontUrl: "./midi/examples/soundfont/",
    instrument: "acoustic_grand_piano",
    onprogress: (state, progress) => {
      console.log(state, progress)
    },
    onsuccess: () => {
      console.log('success')
      MIDI.setVolume(0, 127)
      ctx.setState({initialized: true})
      console.log('initialize midi complete')
      ctx.setState({onPlayBtnClick: () => { play(MIDI, ctx) }})
    },
    onerror: (e) => {
      alert('error')
      alert(e)
    },
  })
}

const play = (MIDI, ctx) => {
  const intervals = getIntervals(ctx.state.interval)
  const base = 50
  const a = base + Math.floor(Math.random() * (120 / 10))
  const answer = intervals[randomAns(intervals)]
  const b = a + answer
  const notes = (() => { 
    switch (ctx.state.order) {
      case'desc':
        return [b, a]
      case'random':
        return shuffle([a, b])
      case 'asc':
      default:
        return [a, b]
    }
  })()
  
  const player = () => Note.play(MIDI, notes)
  console.log('play', notes)
  ctx.setState({onPlayBtnClick: player})
  player()
  mkAnswerBtn(MIDI, ctx)(intervals)(answer)(player)
}

const getIntervals = (interval) => {
  const simple = [ 4 , 7 , 12 ] // M3, P5, Octave
  const diatonic = [ 2, 5, 9, 11 ]// M2, M4, M6, M7
  const all = [ 1, 3, 6, 10, 13, 14, 15] // m2, m3, +4, 7th, m9, 9, +9
  switch (interval) {
    case 'diatonic':
      return simple.concat(diatonic)
    case 'all':
      return simple.concat(diatonic).concat(all)
    case 'simple':
    default:
      return simple
  }
}

const randomAns = intervals => {
  return Math.floor(Math.random() * ((intervals.length * 10) / 10))
}

const shuffle = intervals => {
  const _shuffled = []
  while (_shuffled.length < intervals.length) {
    const selected = intervals[randomAns(intervals)]
    if (_shuffled.indexOf(selected) === -1) {
      _shuffled.push(selected)
    }
  }
  return _shuffled
}

class Note {}
Note.play = (MIDI, notes) => {
  const velocity = 127 // how hard the note hits
  notes.forEach((note, i) => {
    setTimeout(() => {
      MIDI.noteOn(0, note, velocity, 0)
      MIDI.noteOff(0, note, 0 + 0.75)
    }, i * 1000)
  })
}

const mkAnswerBtn = (MIDI, ctx) => intervals => answer => player =>{
  const answerBtns = shuffle(intervals).map((interval, i) => {
    return (
      <a className='btn btn-secondary btn-sm'
      key={i}
      onClick={() => {
        if (interval === answer) {
          if (window.confirm('正解! 次へ進む')) {
            ctx.setState({onPlayBtnClick: () => {}})
            play(MIDI, ctx)
          }
        } else {
          alert('残念..')
        }
      }}
      >
      {midi2Interval(interval)}
      </a>
    )
  })
  ctx.setState({answerBtns:
    (<div className='btn-group'>{answerBtns}</div>)})
}

const midi2Interval = (midiInt) => {
  switch (midiInt) {
    case 1:
      return 'm2'
    case 2:
      return 'M2'
    case 3:
      return 'm3'
    case 4:
      return 'M3'
    case 5:
      return 'P4'
    case 6:
      return '+4'
    case 7:
      return 'P5'
    case 8:
      return 'm6'
    case 9:
      return 'M6'
    case 10:
      return 'm7'
    case 11:
      return 'M7'
    case 12:
      return 'Octave'
    case 13:
      return 'm9'
    case 14:
      return '9'
    case 15:
      return '+9'
    default:
      throw `Unknown interval ${midiInt}`
  }
}


