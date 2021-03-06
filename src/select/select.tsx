import * as Nerv from 'nervjs'
import classnames from 'classnames'
import SelectOption from './select-option'
import Icon from '../icon'
import Tag from '../tag'
export type ButtonType = 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'text'
export type ButtonSize = 'large' | 'small' | 'smaller'

export interface SelectProps {
  type?: ButtonType
  className?: string,
  icon?: string
  size?: ButtonSize
  hollow?: boolean
  nativeType?: string
  loading?: boolean
  circle?: boolean
  disabled?: boolean
}

class Select extends Nerv.Component<SelectProps, any> {
  static Option: typeof SelectOption
  static defaultProps = {
    loading: false,
    type: 'default',
    disabled: false
  }

  private dropDown: boolean
  private initClass: string
  private optionDataArr: any[]
  private isClick: boolean
  private childStyle: any[]
  private DISPLAY_NONE: string
  private DISPLAY_BLOCK: string
  private mulChoices: any[]
  private mulChoicesFlag: any[]
  constructor (props: SelectProps) {
    super(props)
    this.mulChoices = []
    this.mulChoicesFlag = [] //判断某个选项是否已选的数组
    this.DISPLAY_NONE = 'display:none;'
    this.DISPLAY_BLOCK = 'display:block;'
    this.dropDown = false
    this.isClick = false //是否选中了某个选项，专门用于处理clearable情况
    this.initClass = 'at-select at-select--single'
    this.optionDataArr = []
    this.childStyle = []
    this.toggleDropDown = this.toggleDropDown.bind(this) //选项列表的出现与否
    this.handleClick = this.handleClick.bind(this) //点中某个选项
    this.renderWrapperClassNames = this.renderWrapperClassNames.bind(this)
    this.handleOverIconX = this.handleOverIconX.bind(this)
    this.handleLeaveIconX = this.handleLeaveIconX.bind(this)
    this.handleClear = this.handleClear.bind(this) //清空选项
    this.handleInput = this.handleInput.bind(this)
    this.hideAllOption = this.hideAllOption.bind(this)
    this.showAllOption = this.showAllOption.bind(this)
    this.windowClickHide = this.windowClickHide.bind(this)
    this.state = {
      dropDownStyle: 'display:none;',
      wrapperClassName: 'at-select at-select--single',
      optionChosen: '请选择',
      optionChosenStyleDown: this.DISPLAY_NONE,
      optionChosenStyleUp: this.DISPLAY_BLOCK,
      iconXShow:  this.DISPLAY_NONE,
      iconChevronShow:  this.DISPLAY_BLOCK,
      inputValue: '',
      noDataShow: this.DISPLAY_NONE,
      dataShow: this.DISPLAY_NONE,
      mulChoicesStyle: [],
      mulChoices: [],
      childStyle: [],
      optionChildren: [] //props进来的选项
    }
  }
  renderWrapperClassNames (props: SelectProps) {
    return classnames(this.initClass, [
      props.disabled ? `at-select--disabled` : '',
      props.size ? `at-select--${props.size}` : `at-select--normal`
    ], props.className)
  }
  handleClose (key, index, e) {
    e.stopPropagation()
    this.mulChoices.splice(key,1)
    this.mulChoicesFlag[index] = false          
    this.childStyle[index] = Object.assign(this.childStyle[index] || {}, {fontWeight:''})
    this.setState({
      mulChoices:this.mulChoices.concat()
    })
  }
  handleClick = (clickHandler, children, index) => {
    return (e: MouseEvent) => {
      if (clickHandler) {
        clickHandler(e)
      }
      if (this.props.filterable) {
        this.setState({
          inputValue: children
        })
      } else {
        if (this.props.multiple) {
          e.stopPropagation()
          if (!this.mulChoicesFlag[index]) {
            this.mulChoices.push({
              'dom': children,
              'optionIndex': index
            })
            this.mulChoicesFlag[index] = true          
            this.childStyle[index] = Object.assign(this.childStyle[index] || {}, {fontWeight:'700'})
            this.setState({
              mulChoices:this.mulChoices.concat(),
              optionChosenStyleUp:  this.DISPLAY_NONE,//收起占位符“请选择”
            })
          }
        } else {
          this.setState({
            optionChosen: children,
            optionChosenStyleDown:  this.DISPLAY_BLOCK, //展示已选择的选项
            optionChosenStyleUp:  this.DISPLAY_NONE,//收起占位符“请选择”
          })
        }
      }
      if (this.props.clearable) {
        const tempStyle = 'at-select--show-clear'
        this.setState({
          wrapperClassName: this.state.wrapperClassName + tempStyle
        })
      }
      if (!this.props.multiple) {
        this.toggleDropDown(e)
      }
      this.isClick = true
    }
  }
  handleOverIconX () {
    if (this.props.clearable) {
      if (this.props.filterable) {
        //如果是可检索类型，只需要input框非空
        if (this.state.inputValue!='') {
          this.setState({
            iconXShow: this.DISPLAY_BLOCK,
            iconChevronShow:  this.DISPLAY_NONE
          })
        }
      } else {
        //非检索类型，还要点击以后
        if (this.isClick) {
          this.setState({
            iconXShow: this.DISPLAY_BLOCK,
            iconChevronShow:  this.DISPLAY_NONE
          })
        }
      }
    }
  }
  handleLeaveIconX () {
    if (this.isClick && this.props.clearable && this.state.inputValue!='') {
      //是否点击了选项
      this.setState({
        iconXShow:  this.DISPLAY_NONE,
        iconChevronShow: this.DISPLAY_BLOCK
      })
    }
  }
  handleClear (e: MouseEvent) {
    //处理clearable清空选项的功能
    e.stopPropagation()
    if (this.props.filterable) {
      this.setState({
        inputValue: '',
        iconXShow: this.DISPLAY_NONE,
        iconChevronShow: this.DISPLAY_BLOCK,
      })
      this.showAllOption()
    } else {
      this.setState({
        iconXShow: this.DISPLAY_NONE,
        iconChevronShow: this.DISPLAY_BLOCK,
        optionChosenStyleDown:  this.DISPLAY_NONE,
        optionChosenStyleUp:  this.DISPLAY_BLOCK
      })
    }
    this.isClick = false
  }
  handleInput (e) {
    const value = e.target.value
    this.setState({
      inputValue: value
    })
    if (!this.dropDown) {
      this.dropDown = !this.dropDown
      let newDropDownStyle = this.DISPLAY_BLOCK
      let wrapperClassName = classnames(this.initClass, 'at-select--visible') 
      this.setState({
        dropDownStyle: newDropDownStyle ,
        wrapperClassName
      })
    }
    this.searchOptionData (value)
  }
  searchOptionData (val) {
    let arrShow: any[]
    arrShow = []
    let allHide = true
    this.optionDataArr.forEach((value, index) => {
      const pattern = new RegExp(val)
      if (pattern.test(value)) {
        arrShow.push(index)
        allHide = false
      }
    })
    if (!allHide) {
      this.setState({
        noDataShow: this.DISPLAY_NONE,
        dataShow: this.DISPLAY_BLOCK
      })
      if (this.childStyle.length>0){
        this.childStyle.forEach((item, index)=>{
          if (arrShow.indexOf(index) === -1) {
            this.childStyle[index] = Object.assign(item || {}, {display:'none'})
          } else {
            this.childStyle[index] = Object.assign(item || {}, {display:'block'})
          }
        })
        this.setState({
          childStyle: this.childStyle.concat()
        })
      }
    } else {
      this.setState({
        noDataShow: this.DISPLAY_BLOCK,
        dataShow: this.DISPLAY_NONE
      })
    }
  }
  hideAllOption () {
    this.childStyle.forEach((item, index)=>{
      this.childStyle[index] = Object.assign(item || {}, {display:'none'})
    })
    this.setState({
      childStyle: this.childStyle.concat()
    })
  }
  showAllOption () {
    this.childStyle.forEach((item, index)=>{
      this.childStyle[index] = Object.assign(item || {}, {display:'block'})
    })
    this.setState({
      childStyle: this.childStyle.concat()
    })
  }
  _renderMultipleChoices () {
    let multipleChoices: any[]
    multipleChoices = []
    if (this.props.multiple) {
      this.state.mulChoices.forEach((item,index)=>{
        this.mulChoicesFlag.push(false)    
        multipleChoices.push(<Tag closable onClose={this.handleClose.bind(this,index,item['optionIndex'])} key={index}>{item['dom']}</Tag>)
      }) 
    }
    return multipleChoices
  }
  _renderPropsChildren () {
    let children: any[]
    children = []
    if (this.props.children as any) {
      Nerv.Children.map(this.props.children as any, (child, i) => {
        let childShow = child.props.children
        if (typeof childShow != 'string') {
          childShow = child.props.label
        }
        this.optionDataArr.push(childShow)
        child.props.onClick = this.handleClick(child.props.onClick, childShow, i)
        child.props.style = this.state.childStyle[i] || {}
        children.push(child)
      }, null)
    }
    return children
  }
  componentWillMount () {
    Nerv.Children.map(this.props.children as any, (child, i) => {
      this.childStyle.push(child.props.style || {})
    }, null)
  }
  render () {
    const props = this.props
    const { style } = props
    let clearBtn = null
    let searchInput = null
    let dropDownStyle = `${this.state.dropDownStyle}`
    if (props.clearable) {
      clearBtn = <Icon type='icon-x' className='at-select__clear' style={this.state.iconXShow} ref='iconx' onClick={this.handleClear} onMouseLeave={this.handleLeaveIconX}/>
    }
    if (props.filterable) {
      searchInput = <input type='text' onChange={this.handleInput} value={this.state.inputValue} placeholder='请输入查询数据' className='at-select__input' />
    }
    return (
      <div className={this.state.wrapperClassName} style={style}>
        <div className='at-select__selection' onClick={this.toggleDropDown}>
          <span className='at-select__placeholder' style={this.state.optionChosenStyleUp}>请选择</span>
          <span className='at-select__selected' style={this.state.optionChosenStyleDown}>{this.state.optionChosen}</span>
          {this._renderMultipleChoices()}
          {searchInput}
          <Icon type='icon-chevron-down' className='at-select__arrow' style={this.state.iconChevronShow} onMouseEnter={this.handleOverIconX}></Icon>
          {clearBtn}
        </div>
        <div className='at-select__dropdown at-select__dropdown--bottom' style={dropDownStyle}>
          <ul className='at-select__not-found' style={this.state.noDataShow}>
            <li>无匹配数据</li>
          </ul>
          <ul className='at-select__list' style={this.state.dataShow}>
            {this.state.optionChildren}
          </ul>
        </div>
      </div>
    )
  }
  initChildStyle () {
    this.setState({
      childStyle: this.childStyle.concat()
    },()=>{
      this.setState({
        optionChildren: this._renderPropsChildren()
      })
    })
    
  }
  componentDidMount () {
    this.initClass = this.renderWrapperClassNames(this.props)
    if (this.props.filterable) {
      this.setState({
        optionChosenStyleDown: this.DISPLAY_NONE,
        optionChosenStyleUp: this.DISPLAY_NONE
      })
    }
    this.setState({
      wrapperClassName: this.initClass
    })
    this.initChildStyle()
    window.addEventListener('click', this.windowClickHide.bind(this))
  }
  toggleDropDown (e) {
    e.stopPropagation()
    if (this.props.disabled) { return false }
    let onClickHandler: any
    if (onClickHandler = this.props.onClick) {onClickHandler(e)}
    let newDropDownStyle = ''
    let wrapperClassName = ''
    this.dropDown = !this.dropDown
    if (this.dropDown) {
      newDropDownStyle = this.DISPLAY_BLOCK
      wrapperClassName = classnames(this.initClass, 'at-select--visible')
      if (this.props.filterable) {
        this.searchOptionData('')
      } else {
        this.setState({
          noDataShow: this.DISPLAY_NONE,
          dataShow: this.DISPLAY_BLOCK
        })
      }
    } else {
      newDropDownStyle =  this.DISPLAY_NONE
      wrapperClassName = classnames(this.initClass)
    }
    this.setState({
      dropDownStyle: newDropDownStyle ,
      wrapperClassName
    })
  }
  windowClickHide (e) {
    if (this.dropDown) {
      let wrapperClassName = ''
      this.dropDown = false
      let newDropDownStyle =  this.DISPLAY_NONE
      wrapperClassName = classnames(this.initClass)
      this.setState({
        dropDownStyle: newDropDownStyle ,
        wrapperClassName
      })
    }
  }
  assignStyle () {

  }
}

export default Select
