import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Plus, X, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Checkbox } from '@/components/ui/checkbox';

type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
type OrderDirection = 'ASC' | 'DESC';

interface Column {
  table?: string;
  name: string;
  alias?: string;
}

interface Join {
  type: JoinType;
  table: string;
  alias?: string;
  on: string;
}

interface WhereCondition {
  column: string;
  operator: string;
  value: string;
  andOr: 'AND' | 'OR';
}

interface OrderBy {
  column: string;
  direction: OrderDirection;
}

export function SQLQueryBuilder() {
  const [queryType, setQueryType] = useState<QueryType>('SELECT');
  const [tableName, setTableName] = useState('');
  const [tableAlias, setTableAlias] = useState('');
  const [columns, setColumns] = useState<Column[]>([{ name: '*' }]);
  const [joins, setJoins] = useState<Join[]>([]);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<OrderBy[]>([]);
  const [limit, setLimit] = useState('');
  const [offset, setOffset] = useState('');
  const [distinct, setDistinct] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState('');

  // For INSERT
  const [insertColumns, setInsertColumns] = useState<string[]>(['']);
  const [insertValues, setInsertValues] = useState<string[]>(['']);

  // For UPDATE
  const [updateSets, setUpdateSets] = useState<{ column: string; value: string }[]>([{ column: '', value: '' }]);

  const generateQuery = () => {
    let query = '';

    switch (queryType) {
      case 'SELECT':
        query = generateSelectQuery();
        break;
      case 'INSERT':
        query = generateInsertQuery();
        break;
      case 'UPDATE':
        query = generateUpdateQuery();
        break;
      case 'DELETE':
        query = generateDeleteQuery();
        break;
    }

    setGeneratedQuery(query);
  };

  const generateSelectQuery = () => {
    let query = 'SELECT';
    if (distinct) query += ' DISTINCT';

    // Columns
    const columnStr = columns.map(col => {
      let str = col.table ? `${col.table}.${col.name}` : col.name;
      if (col.alias) str += ` AS ${col.alias}`;
      return str;
    }).join(', ');
    query += ` ${columnStr}`;

    // FROM
    query += `\nFROM ${tableName}`;
    if (tableAlias) query += ` AS ${tableAlias}`;

    // JOINs
    joins.forEach(join => {
      query += `\n${join.type} JOIN ${join.table}`;
      if (join.alias) query += ` AS ${join.alias}`;
      query += ` ON ${join.on}`;
    });

    // WHERE
    if (whereConditions.length > 0) {
      query += '\nWHERE ';
      whereConditions.forEach((condition, index) => {
        if (index > 0) query += ` ${condition.andOr} `;
        query += `${condition.column} ${condition.operator} ${condition.value}`;
      });
    }

    // GROUP BY
    if (groupBy.length > 0 && groupBy[0]) {
      query += `\nGROUP BY ${groupBy.join(', ')}`;
    }

    // ORDER BY
    if (orderBy.length > 0) {
      const orderByStr = orderBy.map(o => `${o.column} ${o.direction}`).join(', ');
      if (orderByStr) query += `\nORDER BY ${orderByStr}`;
    }

    // LIMIT / OFFSET
    if (limit) query += `\nLIMIT ${limit}`;
    if (offset) query += ` OFFSET ${offset}`;

    return query + ';';
  };

  const generateInsertQuery = () => {
    const validColumns = insertColumns.filter(c => c);
    const validValues = insertValues.filter(v => v);
    
    if (!tableName || validColumns.length === 0) return '';
    
    let query = `INSERT INTO ${tableName}`;
    query += ` (${validColumns.join(', ')})`;
    query += `\nVALUES (${validValues.join(', ')})`;
    
    return query + ';';
  };

  const generateUpdateQuery = () => {
    if (!tableName || updateSets.filter(s => s.column).length === 0) return '';
    
    let query = `UPDATE ${tableName}`;
    
    const setStatements = updateSets
      .filter(s => s.column && s.value)
      .map(s => `${s.column} = ${s.value}`)
      .join(', ');
    
    if (setStatements) {
      query += `\nSET ${setStatements}`;
    }
    
    // WHERE
    if (whereConditions.length > 0) {
      query += '\nWHERE ';
      whereConditions.forEach((condition, index) => {
        if (index > 0) query += ` ${condition.andOr} `;
        query += `${condition.column} ${condition.operator} ${condition.value}`;
      });
    }
    
    return query + ';';
  };

  const generateDeleteQuery = () => {
    if (!tableName) return '';
    
    let query = `DELETE FROM ${tableName}`;
    
    // WHERE
    if (whereConditions.length > 0) {
      query += '\nWHERE ';
      whereConditions.forEach((condition, index) => {
        if (index > 0) query += ` ${condition.andOr} `;
        query += `${condition.column} ${condition.operator} ${condition.value}`;
      });
    }
    
    return query + ';';
  };

  const addColumn = () => setColumns([...columns, { name: '' }]);
  const removeColumn = (index: number) => setColumns(columns.filter((_, i) => i !== index));
  const updateColumn = (index: number, field: keyof Column, value: string) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };
    setColumns(updated);
  };

  const addJoin = () => setJoins([...joins, { type: 'INNER', table: '', on: '' }]);
  const removeJoin = (index: number) => setJoins(joins.filter((_, i) => i !== index));
  const updateJoin = (index: number, field: keyof Join, value: string) => {
    const updated = [...joins];
    updated[index] = { ...updated[index], [field]: value };
    setJoins(updated);
  };

  const addWhereCondition = () => setWhereConditions([...whereConditions, { column: '', operator: '=', value: '', andOr: 'AND' }]);
  const removeWhereCondition = (index: number) => setWhereConditions(whereConditions.filter((_, i) => i !== index));
  const updateWhereCondition = (index: number, field: keyof WhereCondition, value: string) => {
    const updated = [...whereConditions];
    updated[index] = { ...updated[index], [field]: value };
    setWhereConditions(updated);
  };

  const loadExample = () => {
    setQueryType('SELECT');
    setTableName('users');
    setTableAlias('u');
    setColumns([
      { table: 'u', name: 'id' },
      { table: 'u', name: 'username' },
      { table: 'p', name: 'title', alias: 'post_title' },
      { name: 'COUNT(c.id)', alias: 'comment_count' }
    ]);
    setJoins([
      { type: 'LEFT', table: 'posts', alias: 'p', on: 'p.user_id = u.id' },
      { type: 'LEFT', table: 'comments', alias: 'c', on: 'c.post_id = p.id' }
    ]);
    setWhereConditions([
      { column: 'u.created_at', operator: '>', value: "'2024-01-01'", andOr: 'AND' },
      { column: 'p.published', operator: '=', value: 'TRUE', andOr: 'AND' }
    ]);
    setGroupBy(['u.id', 'u.username', 'p.title']);
    setOrderBy([{ column: 'comment_count', direction: 'DESC' }]);
    setLimit('10');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Database className="w-5 h-5" />
            </motion.div>
            <span>SQL Query Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Query Type and Example */}
          <div className="flex gap-4">
            <Select value={queryType} onValueChange={(value: QueryType) => setQueryType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SELECT">SELECT</SelectItem>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadExample}
              className="animate-pulse-hover"
            >
              Load Example
            </Button>
          </div>

          {/* Table Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Table Name</label>
              <Input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g., users"
              />
            </div>
            {queryType === 'SELECT' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Table Alias (optional)</label>
                <Input
                  value={tableAlias}
                  onChange={(e) => setTableAlias(e.target.value)}
                  placeholder="e.g., u"
                />
              </div>
            )}
          </div>

          {/* SELECT specific options */}
          {queryType === 'SELECT' && (
            <>
              {/* DISTINCT */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="distinct"
                  checked={distinct}
                  onCheckedChange={(checked) => setDistinct(!!checked)}
                />
                <label htmlFor="distinct" className="text-sm font-medium cursor-pointer">
                  SELECT DISTINCT
                </label>
              </div>

              {/* Columns */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Columns</label>
                  <Button size="sm" variant="outline" onClick={addColumn} className="animate-pulse-hover">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Column
                  </Button>
                </div>
                <AnimatePresence>
                  {columns.map((column, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-2"
                    >
                      <Input
                        value={column.table || ''}
                        onChange={(e) => updateColumn(index, 'table', e.target.value)}
                        placeholder="Table"
                        className="w-24"
                      />
                      <Input
                        value={column.name}
                        onChange={(e) => updateColumn(index, 'name', e.target.value)}
                        placeholder="Column name or *"
                        className="flex-1"
                      />
                      <Input
                        value={column.alias || ''}
                        onChange={(e) => updateColumn(index, 'alias', e.target.value)}
                        placeholder="Alias (optional)"
                        className="w-32"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeColumn(index)}
                        disabled={columns.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* JOINs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">JOINs (optional)</label>
                  <Button size="sm" variant="outline" onClick={addJoin} className="animate-pulse-hover">
                    <Plus className="w-4 h-4 mr-1" />
                    Add JOIN
                  </Button>
                </div>
                <AnimatePresence>
                  {joins.map((join, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-2 p-3 bg-muted rounded-lg"
                    >
                      <div className="flex gap-2">
                        <Select 
                          value={join.type} 
                          onValueChange={(value: JoinType) => updateJoin(index, 'type', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INNER">INNER</SelectItem>
                            <SelectItem value="LEFT">LEFT</SelectItem>
                            <SelectItem value="RIGHT">RIGHT</SelectItem>
                            <SelectItem value="FULL">FULL</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={join.table}
                          onChange={(e) => updateJoin(index, 'table', e.target.value)}
                          placeholder="Table name"
                          className="flex-1"
                        />
                        <Input
                          value={join.alias || ''}
                          onChange={(e) => updateJoin(index, 'alias', e.target.value)}
                          placeholder="Alias"
                          className="w-24"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeJoin(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={join.on}
                        onChange={(e) => updateJoin(index, 'on', e.target.value)}
                        placeholder="ON condition (e.g., t1.id = t2.user_id)"
                        className="w-full"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* INSERT specific options */}
          {queryType === 'INSERT' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Columns and Values</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Column Names</p>
                    {insertColumns.map((col, index) => (
                      <Input
                        key={index}
                        value={col}
                        onChange={(e) => {
                          const updated = [...insertColumns];
                          updated[index] = e.target.value;
                          setInsertColumns(updated);
                        }}
                        placeholder="column_name"
                      />
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setInsertColumns([...insertColumns, '']);
                        setInsertValues([...insertValues, '']);
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Column
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Values</p>
                    {insertValues.map((val, index) => (
                      <Input
                        key={index}
                        value={val}
                        onChange={(e) => {
                          const updated = [...insertValues];
                          updated[index] = e.target.value;
                          setInsertValues(updated);
                        }}
                        placeholder="'value' or expression"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UPDATE specific options */}
          {queryType === 'UPDATE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">SET Columns</label>
              <AnimatePresence>
                {updateSets.map((set, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-2"
                  >
                    <Input
                      value={set.column}
                      onChange={(e) => {
                        const updated = [...updateSets];
                        updated[index].column = e.target.value;
                        setUpdateSets(updated);
                      }}
                      placeholder="column_name"
                      className="flex-1"
                    />
                    <span className="self-center">=</span>
                    <Input
                      value={set.value}
                      onChange={(e) => {
                        const updated = [...updateSets];
                        updated[index].value = e.target.value;
                        setUpdateSets(updated);
                      }}
                      placeholder="'value' or expression"
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setUpdateSets(updateSets.filter((_, i) => i !== index))}
                      disabled={updateSets.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUpdateSets([...updateSets, { column: '', value: '' }])}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Column
              </Button>
            </div>
          )}

          {/* WHERE conditions (for SELECT, UPDATE, DELETE) */}
          {(queryType === 'SELECT' || queryType === 'UPDATE' || queryType === 'DELETE') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">WHERE Conditions (optional)</label>
                <Button size="sm" variant="outline" onClick={addWhereCondition} className="animate-pulse-hover">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Condition
                </Button>
              </div>
              <AnimatePresence>
                {whereConditions.map((condition, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-2"
                  >
                    {index > 0 && (
                      <Select 
                        value={condition.andOr} 
                        onValueChange={(value: 'AND' | 'OR') => updateWhereCondition(index, 'andOr', value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Input
                      value={condition.column}
                      onChange={(e) => updateWhereCondition(index, 'column', e.target.value)}
                      placeholder="column"
                      className="flex-1"
                    />
                    <Select 
                      value={condition.operator} 
                      onValueChange={(value) => updateWhereCondition(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value="!=">{`!=`}</SelectItem>
                        <SelectItem value="<">{`<`}</SelectItem>
                        <SelectItem value=">">{`>`}</SelectItem>
                        <SelectItem value="<=">{`<=`}</SelectItem>
                        <SelectItem value=">=">{`>=`}</SelectItem>
                        <SelectItem value="LIKE">LIKE</SelectItem>
                        <SelectItem value="IN">IN</SelectItem>
                        <SelectItem value="IS NULL">IS NULL</SelectItem>
                        <SelectItem value="IS NOT NULL">IS NOT NULL</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={condition.value}
                      onChange={(e) => updateWhereCondition(index, 'value', e.target.value)}
                      placeholder="value"
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeWhereCondition(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* GROUP BY (SELECT only) */}
          {queryType === 'SELECT' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">GROUP BY (optional)</label>
              <Input
                value={groupBy.join(', ')}
                onChange={(e) => setGroupBy(e.target.value.split(',').map(s => s.trim()))}
                placeholder="column1, column2, ..."
              />
            </div>
          )}

          {/* ORDER BY (SELECT only) */}
          {queryType === 'SELECT' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">ORDER BY (optional)</label>
              <div className="flex gap-2">
                <Input
                  value={orderBy[0]?.column || ''}
                  onChange={(e) => setOrderBy([{ column: e.target.value, direction: orderBy[0]?.direction || 'ASC' }])}
                  placeholder="column"
                  className="flex-1"
                />
                <Select 
                  value={orderBy[0]?.direction || 'ASC'} 
                  onValueChange={(value: OrderDirection) => setOrderBy([{ column: orderBy[0]?.column || '', direction: value }])}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASC">ASC</SelectItem>
                    <SelectItem value="DESC">DESC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* LIMIT/OFFSET (SELECT only) */}
          {queryType === 'SELECT' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">LIMIT (optional)</label>
                <Input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OFFSET (optional)</label>
                <Input
                  type="number"
                  value={offset}
                  onChange={(e) => setOffset(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateQuery} 
            className="w-full animate-pulse-hover"
            disabled={!tableName}
          >
            Generate SQL Query
          </Button>

          {/* Generated Query */}
          <AnimatePresence>
            {generatedQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Generated Query</label>
                  <CopyButton text={generatedQuery} />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="font-mono text-sm whitespace-pre-wrap">{generatedQuery}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}