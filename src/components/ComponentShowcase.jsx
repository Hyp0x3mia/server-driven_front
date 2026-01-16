import React from 'react';
import { motion } from 'framer-motion';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon, Info, Bot, Settings, LineChart } from 'lucide-react';

const ComponentShowcase = () => {
  const [date, setDate] = React.useState(new Date());

  const models = [
    { model: 'GPT-4', params: '1.76T', type: 'Language', accuracy: '86.4%' },
    { model: 'DALL-E 3', params: 'N/A', type: 'Image', accuracy: 'N/A' },
    { model: 'Sora', params: 'N/A', type: 'Video', accuracy: 'N/A' },
    { model: 'AlphaFold 2', params: 'N/A', type: 'Science', accuracy: '90+ GDT' },
  ];

  const showcaseItems = [
    {
      title: '数据表格',
      icon: <LineChart className="w-6 h-6" />,
      colSpan: 'md:col-span-2',
      content: (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模型</TableHead>
              <TableHead>参数量</TableHead>
              <TableHead>类型</TableHead>
              <TableHead className="text-right">准确率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.model}>
                <TableCell className="font-medium">{model.model}</TableCell>
                <TableCell>{model.params}</TableCell>
                <TableCell>{model.type}</TableCell>
                <TableCell className="text-right">{model.accuracy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
    {
      title: '日历组件',
      icon: <LineChart className="w-6 h-6" />,
      content: <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />,
    },
    {
      title: '轮播图',
      icon: <ImageIcon className="w-6 h-6" />,
      colSpan: 'md:col-span-3',
      content: (
        <Carousel className="w-full">
          <CarouselContent>
            {[1, 2, 3, 4].map(index => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <div className="bg-slate-800/50 h-48 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400">AI 生成图片 #{index}</span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ),
    },
    {
      title: '交互控件',
      icon: <Settings className="w-6 h-6" />,
      colSpan: 'md:col-span-2',
      content: (
        <div className="space-y-6 p-4">
            <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className='text-slate-300'>启用AI助手</span>
                </div>
                <Switch id="ai-assistant" />
            </div>
            <div className="space-y-2">
                <label className='text-sm text-slate-400'>模型温度</label>
                <Slider defaultValue={[50]} max={100} step={1} />
            </div>
             <div className="space-y-2">
                <label className='text-sm text-slate-400'>训练进度</label>
                <Progress value={75} />
            </div>
        </div>
      ),
    },
    {
      title: '信息提示',
      icon: <Info className="w-6 h-6" />,
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">弹出提示</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-slate-800 border-slate-700 text-slate-200">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">什么是Transformer?</h4>
                  <p className="text-sm text-slate-400">
                    一种基于自注意力机制的深度学习模型。
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Dialog>
            <DialogTrigger asChild>
              <Button>打开对话框</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-slate-100">联系我们</DialogTitle>
              </DialogHeader>
              <p className='text-slate-300'>这是一个对话框的最佳实践案例.</p>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
     {
      title: '选项卡',
      icon: <Bot className="w-6 h-6" />,
      colSpan: 'md:col-span-3',
      content: (
        <Tabs defaultValue="llm" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="llm">大语言模型</TabsTrigger>
                <TabsTrigger value="cv">计算机视觉</TabsTrigger>
                <TabsTrigger value="speech">语音识别</TabsTrigger>
            </TabsList>
            <TabsContent value="llm">
                <Card className='bg-transparent border-none'>
                    <CardHeader>
                        <CardTitle>大语言模型</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       <p className='text-sm text-slate-300'>大语言模型是能够理解和生成人类语言的AI模型。</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      ),
    },
  ];

  return (
    <motion.section
      className="mb-32"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-teal-300 to-sky-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        交互式组件展示
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {showcaseItems.map((item, index) => (
          <motion.div
            key={index}
            className={item.colSpan || ''}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <GlassmorphismCard className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                {item.icon}
                <h3 className="text-lg font-bold text-slate-100">{item.title}</h3>
              </div>
              <div className="flex-grow">{item.content}</div>
            </GlassmorphismCard>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default ComponentShowcase;
