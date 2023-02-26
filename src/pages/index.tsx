
import { Input, Row, Col, Form, Slider, Popover, Button, Switch, Upload, InputNumber } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PhotoshopPicker } from 'react-color';
import {CloseOutlined, UploadOutlined} from '@ant-design/icons'
import styles from './index.less';
import './style.less'
import type { UploadProps } from 'antd';
import store2 from 'store2'
import convert from 'color-convert'
import { range } from '@umijs/deps/compiled/lodash';


function dataURLToCanvas(dataurl: string, cb?: any){
  var canvas = document.querySelector('#canvas-input') as HTMLCanvasElement
	// var canvas = document.createElement('CANVAS') as HTMLCanvasElement;
	var ctx = canvas.getContext('2d');
	var img = new Image();
	img.onload = function(){
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
		cb && cb(canvas);
	};
	img.src = dataurl;
}

// function blobToCanvas(blob: any, cb?: any){
// 	fileOrBlobToDataURL(blob, function (dataurl: string){
// 		dataURLToCanvas(dataurl, cb);
// 	});
// }

function fileOrBlobToDataURL(blob: any, cb:any){
	var a = new FileReader();
	a.readAsDataURL(blob);
	a.onload = function (e){
		dataURLToCanvas(e.target.result, cb);
	};
}

function pickColor(color1: number[], color2: number[], weight:number) {
  var w1 = weight;
  var w2 = 1 - w1;
  var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
      Math.round(color1[1] * w1 + color2[1] * w2),
      Math.round(color1[2] * w1 + color2[2] * w2)];
  return rgb;
}

function baseInRange(number: number, start: number, end: number, offset = 10) {
  return number >= Math.min(start, end) - offset && number <= Math.max(start, end) + offset
}
function hslInRange(number: number, start: number, end: number) {

}

export default function IndexPage() {
  const [form] = Form.useForm();
  const canvasRef = useRef()
  const outCanvasRef = useRef()
  const [colorInfo, setColorInfo] = useState([
    '#ff0000',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#0000ff',
  ])
  // const displayColorInfo = useMemo(()=> {
  //   return colorInfo.map((hsl)=> {
  //     const tmp:number[] = [colorInfo[i].h, colorInfo[i].s * 100, colorInfo[i].l * 100]
  //     return `#${convert.hsl.hex(tmp)}`
  //   })
  // }, [colorInfo])
  const [positionInfo, setPositionInfo] = useState({
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    offset: 10,
  })

  const [rangeInfo, setRangeInfo] = useState([22, 78])
  const [message, setMessage] = useState('')
  useEffect(()=>{
    const info = store2.get('info')
    console.log(info, 'load')
    setColorInfo(info.color)
    setPositionInfo(info.position)
    setRangeInfo(info.range)
    outCanvasRef.current = document.querySelector('#canvas-output') 
    form.setFieldsValue(info.position)
  }, [])

  // useEffect(()=>{


  // }, [rangeInfo])
  

  useEffect(()=>{
    const info = {
      color: colorInfo,
      position: positionInfo,
      range: rangeInfo
    }
    console.log(info, 'save')
    store2.set('info', info)
  }, [colorInfo, positionInfo, rangeInfo])
  
  const [linear, setLinear] = useState(true)
  const marks:any = {}
  const length =  colorInfo.length
  for (let i = 0; i < length; i++ ) {
    const position = (i / (length - 1)).toFixed(2) * 100

    marks[position] = {
      label:  <div style={{display: 'flex'}}><Popover placement="right" content={<PhotoshopPicker  color={colorInfo[i]} onChange={(v)=>{
        colorInfo[i] = v.hex
        setColorInfo([...colorInfo])
      }} />} trigger="click">
        <Button style={{marginLeft: 30, background: colorInfo[i]}}></Button>
       </Popover>
       {/* <Button style={{marginLeft: 10}} icon={<CloseOutlined onClick={()=>{ 
         if (colorInfo.length < 3) {
          return
         }
         colorInfo.splice(i, 1)
         setColorInfo([...colorInfo])
       }}/>}></Button> */}
       </div>,
    }
  }
  useEffect(() =>{
    const outCanvas = outCanvasRef.current 
    outCanvas.width = positionInfo.width
    outCanvas.height = positionInfo.height
    const outCtx = outCanvas.getContext('2d')
    const outImageData = outCtx.getImageData(0, 0, positionInfo.width, positionInfo.height)
    const data = outImageData.data
    const size = data.length / 4
    for (let i = 0; i < size; i++) {
      data[i * 4] = 0
      data[i * 4 + 1] = 0
      data[i * 4 + 2] = 0
      data[i * 4 + 3] = 100
    }
    outCtx.putImageData(outImageData, 0, 0)
    
  }, [positionInfo])
  
  const analyse = ()=>{
    const canvas = canvasRef.current 
    const outCanvas = outCanvasRef.current 
    if (canvas) {
      
      outCanvas.width = positionInfo.width
      outCanvas.height = positionInfo.height
      const outCtx = outCanvas.getContext('2d')
      const outImageData = outCtx.getImageData(0, 0, positionInfo.width, positionInfo.height)
      const imageData = canvas.getContext('2d').getImageData(positionInfo.x, positionInfo.y, positionInfo.width, positionInfo.height)
      console.log(imageData, 'imageDataimageDataimageData')
      const colorRangeInfo:any = [] 
      const length =  colorInfo.length
   
      // colorInfo.forEach((color, i)=>{
      //   const nextColor = colorInfo[i+1]
      //   const array1 = convert.hex.rgb(color)
      //   const array2 = convert.hex.rgb(nextColor)
      //   const position = (i / (length - 1)).toFixed(2) * 100
      //   const obj:any = {
      //     position,
      //     r: array1[0],
      //     g: array1[1],
      //     b: array1[2],
      //   }
      //   colorRangeInfo.push(obj)
      // })
      const startHSL = convert.hex.hsl(colorInfo[0])
      const endHSL = convert.hex.hsl(colorInfo[colorInfo.length - 1])
      const unitH = (endHSL[0] - startHSL[0]) / 100
      let startH = startHSL[0] + rangeInfo[0] * unitH ;
      let endH = startHSL[0] + rangeInfo[1] * unitH
      // rangeInfo.forEach((position, i)=>{
      //   // startH = startH + position * rangeH
      //   const unit = (100 / (length - 1))
      //   const idx = Math.floor(position / unit)
        
      //   const weight = (position%unit)/unit
      //   const color = colorInfo[idx]
      //   const nextColor = colorInfo[idx+1]
       
      //   if (true) {
      //     const array1 = convert.hex.rgb(color)
      //     const array2 = nextColor ? convert.hex.rgb(nextColor) : convert.hex.rgb(color)
      //     const rgb = pickColor(array2, array1, weight )
        
      //     const obj = {
      //       position,
      //       start: i === 0 ? true : false,
      //       end: i !== 0 ? true : false,
      //       r: rgb[0],
      //       g: rgb[1],
      //       b: rgb[2]
      //     }
        
      //     colorRangeInfo.splice(idx+1+i, 0, obj)
      //   }  
      // })
      // const rangeLength =  colorRangeInfo.length
      // const rangeResult = []
      // let check = false
      // for (let i = 0; i < rangeLength; i++) {
      //   const item = colorRangeInfo[i]
      //   if (item.start === true) {
      //     check = true
      //   }
      //   if (item.end === true) {
      //     check = false
      //   }
      //   if (check) {
      //     rangeResult.push({
      //       r:[colorRangeInfo[i].r, colorRangeInfo[i+1].r], 
      //       g:[colorRangeInfo[i].g, colorRangeInfo[i+1].g], 
      //       b:[colorRangeInfo[i].b, colorRangeInfo[i+1].b], 
      //     })
      //   }
      // }
      console.log(colorRangeInfo, 'rgb')
      
      const checkData = []
      const data = imageData.data
      const size = data.length / 4
      console.log(size, imageData)
      let passNumber = 0
      for (let i = 0; i < size; i++) {
        const hsl = convert.rgb.hsl([data[i * 4], data[i * 4 + 1], data[i * 4 + 2]])
        let pass =  baseInRange(hsl[0], startH, endH, positionInfo.offset)  
       
        if (pass) {
          
          outImageData.data[i * 4] = 255
          outImageData.data[i * 4 + 1] = 255
          outImageData.data[i * 4 + 2] = 255
          outImageData.data[i * 4 + 3] = 0
          passNumber += 1
        } else {
          
          outImageData.data[i * 4] = 0
          outImageData.data[i * 4 + 1] = 0
          outImageData.data[i * 4 + 2] = 0
          outImageData.data[i * 4 + 3] = 100
        }

       
        // checkData.push({

        // })
      }
      console.log(outImageData, 'outImageData')
      outCtx.putImageData(outImageData, 0, 0)
      setMessage(`所选${size}像素, 通过${passNumber}, 占比 ${(passNumber/size).toFixed(2) * 100} %`)



      
    }
   
  }

  const linearColor = `linear-gradient(to bottom, ${colorInfo.join(',')} ) `

  const sliderBoxStyle: React.CSSProperties = {
    display: 'inline-block',
    height: 300,
    marginLeft: 70,
    '--main-bg-color': linearColor,
  };

  return (
    <div>
      <h1 className={styles.title}>SBLBK {message}</h1>
      
      <div>
        <Row gutter={20}>
          <Col span={20}>
          <Upload  beforeUpload={(data)=>{
            console.log(data, 'fileOrBlobToDataURL')
            fileOrBlobToDataURL(data, (canvas)=>{
              console.log(canvas, canvasRef)
              canvasRef.current = canvas
            })
          }}>
          <Button icon={<UploadOutlined  />}>Click to Upload</Button>
          
          </Upload>
          <div className="img-input-box">
              <div className="select-box" style={{
                top: positionInfo.y + 'px',
                left: positionInfo.x + 'px',
                width: positionInfo.width + 'px',
                height: positionInfo.height + 'px',
              }}> <canvas id="canvas-output"></canvas></div>
              <canvas id="canvas-input"></canvas>
            </div>
          </Col>
       
          <Col span={4}>
            <div style={{marginLeft: 20, height: 60}}>
              渐变
            <Switch style={{marginLeft: 10}}
              checked={linear}
              onChange={(v)=>{
                setLinear(v)
                // colorInfo.push('#ddd')
                // setColorInfo([...colorInfo])
              }}
            ></Switch>
            <Button style={{marginLeft: 10}}
              disabled
              onClick={()=>{
                colorInfo.push('#ddd')
                setColorInfo([...colorInfo])
              }}
            >新增颜色</Button></div>
            <div style={sliderBoxStyle}>
              <Slider vertical value={rangeInfo} onChange={(range)=>{
               
                setRangeInfo(range)
              }} range reverse marks={marks} defaultValue={[22, 78]} />
            </div>
            <div style={{marginLeft: 100, marginTop:35, height: 60}}></div>
              <Form form={form} 
                style={{width: 320, paddingLeft: 60}}
                name="advanced_search" 
                colon={false} 
                labelAlign='left' 
                labelCol={{ span: 6 }} onValuesChange={(v)=>{
                  setPositionInfo({...positionInfo, ...v})
                  // clearCanvasOutput()
              }}>
                <Form.Item name={['x']} label="X" >
                  <InputNumber />
                </Form.Item>
                <Form.Item name={['y']} label="Y" >
                  <InputNumber />
                </Form.Item>
                <Form.Item name={['width']} label="width" >
                  <InputNumber />
                </Form.Item>
                <Form.Item name={['height']} label="height" >
                  <InputNumber />
                </Form.Item>
                <Form.Item name={['offset']} label="允许误差" >
                  <InputNumber />
                </Form.Item>
              </Form>
              <div>{<Button type="primary" style={{marginLeft: 100}}
                onClick={()=>{analyse()}}
              >分析</Button>}</div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
