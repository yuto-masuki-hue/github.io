import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowRight } from 'lucide-react';

export default function DataEditor({ initialData, onComplete }) {
  const [data, setData] = useState(initialData);

  // Initialize assignments if not present
  useEffect(() => {
    if (!data.assignments) {
      const initialAssignments = {};
      data.properties?.forEach(p => {
        initialAssignments[p.id] = ""; // Default to unassigned
      });
      setData(prev => ({ ...prev, assignments: initialAssignments }));
    }
  }, []);

  const updateDeceased = (field, value) => {
    setData(prev => ({
      ...prev,
      deceased: { ...prev.deceased, [field]: value }
    }));
  };

  const updateHeir = (index, field, value) => {
    const newHeirs = [...data.heirs];
    newHeirs[index] = { ...newHeirs[index], [field]: value };
    setData(prev => ({ ...prev, heirs: newHeirs }));
  };

  const addHeir = () => {
    setData(prev => ({
      ...prev,
      heirs: [...prev.heirs, { id: `h${Date.now()}`, name: "", relation: "", address: "" }]
    }));
  };

  const removeHeir = (index) => {
    const newHeirs = data.heirs.filter((_, i) => i !== index);
    setData(prev => ({ ...prev, heirs: newHeirs }));
  };

  const updateProperty = (index, field, value) => {
    const newProps = [...data.properties];
    newProps[index] = { ...newProps[index], [field]: value };
    setData(prev => ({ ...prev, properties: newProps }));
  };

  const addProperty = () => {
    const newId = `p${Date.now()}`;
    setData(prev => ({
      ...prev,
      properties: [...prev.properties, { id: newId, type: "預貯金", details: "", value: "" }],
      assignments: { ...prev.assignments, [newId]: "" }
    }));
  };

  const removeProperty = (index) => {
    const propId = data.properties[index].id;
    const newProps = data.properties.filter((_, i) => i !== index);
    const newAssignments = { ...data.assignments };
    delete newAssignments[propId];
    
    setData(prev => ({ 
      ...prev, 
      properties: newProps,
      assignments: newAssignments
    }));
  };

  const updateAssignment = (propertyId, heirId) => {
    setData(prev => ({
      ...prev,
      assignments: { ...prev.assignments, [propertyId]: heirId }
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">情報の確認と編集</h2>
          <p className="text-gray-500">AIが抽出した内容を確認し、遺産の分割方法を指定してください。</p>
        </div>
        <Button onClick={() => onComplete(data)} className="bg-gray-900 hover:bg-gray-800">
          プレビューへ進む <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <Tabs defaultValue="deceased" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
          <TabsTrigger value="deceased">被相続人</TabsTrigger>
          <TabsTrigger value="heirs">相続人</TabsTrigger>
          <TabsTrigger value="properties">財産目録</TabsTrigger>
          <TabsTrigger value="division">分割指定</TabsTrigger>
        </TabsList>

        <TabsContent value="deceased">
          <Card>
            <CardHeader>
              <CardTitle>被相続人（亡くなった方）の情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>氏名</Label>
                  <Input 
                    value={data.deceased?.name || ''} 
                    onChange={e => updateDeceased('name', e.target.value)}
                    placeholder="例: 山田 太郎"
                  />
                </div>
                <div className="space-y-2">
                  <Label>死亡年月日</Label>
                  <Input 
                    value={data.deceased?.deathDate || ''} 
                    onChange={e => updateDeceased('deathDate', e.target.value)}
                    placeholder="例: 令和5年1月1日"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>最後の住所</Label>
                  <Input 
                    value={data.deceased?.lastAddress || ''} 
                    onChange={e => updateDeceased('lastAddress', e.target.value)}
                    placeholder="例: 東京都千代田区..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heirs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>相続人の情報</CardTitle>
              <Button size="sm" variant="outline" onClick={addHeir}>
                <Plus className="w-4 h-4 mr-1" /> 追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.heirs?.map((heir, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg bg-gray-50/50">
                  <div className="flex-1 grid grid-cols-12 gap-3">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs text-gray-500">氏名</Label>
                      <Input 
                        value={heir.name} 
                        onChange={e => updateHeir(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-gray-500">続柄</Label>
                      <Input 
                        value={heir.relation} 
                        onChange={e => updateHeir(index, 'relation', e.target.value)}
                        placeholder="長男など"
                      />
                    </div>
                    <div className="col-span-7 space-y-1">
                      <Label className="text-xs text-gray-500">住所</Label>
                      <Input 
                        value={heir.address} 
                        onChange={e => updateHeir(index, 'address', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeHeir(index)} className="mt-5 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>財産目録</CardTitle>
              <Button size="sm" variant="outline" onClick={addProperty}>
                <Plus className="w-4 h-4 mr-1" /> 追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.properties?.map((prop, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg bg-gray-50/50">
                  <div className="flex-1 grid grid-cols-1 gap-3">
                    <div className="flex gap-3">
                      <div className="w-1/3 space-y-1">
                         <Label className="text-xs text-gray-500">種類</Label>
                         <Input 
                          value={prop.type} 
                          onChange={e => updateProperty(index, 'type', e.target.value)}
                          placeholder="預貯金/不動産"
                        />
                      </div>
                      <div className="w-2/3 space-y-1">
                         <Label className="text-xs text-gray-500">評価額・金額</Label>
                         <Input 
                          value={prop.value} 
                          onChange={e => updateProperty(index, 'value', e.target.value)}
                          placeholder="10,000,000円"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">詳細（所在、口座番号など）</Label>
                      <Input 
                        value={prop.details} 
                        onChange={e => updateProperty(index, 'details', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeProperty(index)} className="mt-8 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="division">
          <Card>
            <CardHeader>
              <CardTitle>遺産の分割指定</CardTitle>
              <p className="text-sm text-gray-500">各財産を誰が相続するか指定してください。</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.properties?.map((prop) => (
                <div key={prop.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 mr-4">
                    <div className="font-medium">{prop.type}</div>
                    <div className="text-sm text-gray-500 truncate">{prop.details}</div>
                    <div className="text-xs text-gray-400 mt-1">{prop.value}</div>
                  </div>
                  <div className="w-64">
                    <Select 
                      value={data.assignments?.[prop.id] || "unassigned"} 
                      onValueChange={(val) => updateAssignment(prop.id, val)}
                    >
                      <SelectTrigger className={data.assignments?.[prop.id] ? "border-indigo-200 bg-indigo-50" : ""}>
                        <SelectValue placeholder="相続人を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" className="text-gray-400">未指定</SelectItem>
                        {data.heirs?.map(heir => (
                          <SelectItem key={heir.id} value={heir.id}>
                            {heir.name} ({heir.relation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}