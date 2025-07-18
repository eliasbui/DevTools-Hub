import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, Copy, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Checkbox } from '@/components/ui/checkbox';

type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite' | 'mssql' | 'oracle';

interface ConnectionParams {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  // MongoDB specific
  authSource?: string;
  replicaSet?: string;
  // Additional params
  additionalParams: { key: string; value: string }[];
}

const defaultPorts: Record<DatabaseType, string> = {
  postgresql: '5432',
  mysql: '3306',
  mongodb: '27017',
  redis: '6379',
  sqlite: '',
  mssql: '1433',
  oracle: '1521',
};

export function ConnectionStringBuilder() {
  const [dbType, setDbType] = useState<DatabaseType>('postgresql');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionString, setConnectionString] = useState('');
  const [params, setParams] = useState<ConnectionParams>({
    host: 'localhost',
    port: defaultPorts.postgresql,
    database: '',
    username: '',
    password: '',
    ssl: false,
    authSource: 'admin',
    replicaSet: '',
    additionalParams: [],
  });

  const updateParam = (field: keyof ConnectionParams, value: any) => {
    setParams({ ...params, [field]: value });
  };

  const addAdditionalParam = () => {
    setParams({
      ...params,
      additionalParams: [...params.additionalParams, { key: '', value: '' }],
    });
  };

  const updateAdditionalParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...params.additionalParams];
    updated[index][field] = value;
    setParams({ ...params, additionalParams: updated });
  };

  const removeAdditionalParam = (index: number) => {
    setParams({
      ...params,
      additionalParams: params.additionalParams.filter((_, i) => i !== index),
    });
  };

  const generateConnectionString = () => {
    let connStr = '';

    switch (dbType) {
      case 'postgresql':
        connStr = `postgresql://${params.username}:${params.password}@${params.host}:${params.port}/${params.database}`;
        if (params.ssl) connStr += '?sslmode=require';
        break;

      case 'mysql':
        connStr = `mysql://${params.username}:${params.password}@${params.host}:${params.port}/${params.database}`;
        if (params.ssl) connStr += '?ssl=true';
        break;

      case 'mongodb':
        const mongoAuth = params.username && params.password ? `${params.username}:${params.password}@` : '';
        connStr = `mongodb://${mongoAuth}${params.host}:${params.port}/${params.database}`;
        const mongoParams = [];
        if (params.authSource && params.authSource !== 'admin') {
          mongoParams.push(`authSource=${params.authSource}`);
        }
        if (params.replicaSet) {
          mongoParams.push(`replicaSet=${params.replicaSet}`);
        }
        if (params.ssl) {
          mongoParams.push('ssl=true');
        }
        if (mongoParams.length > 0) {
          connStr += '?' + mongoParams.join('&');
        }
        break;

      case 'redis':
        const redisAuth = params.password ? `:${params.password}@` : '';
        connStr = `redis://${redisAuth}${params.host}:${params.port}`;
        if (params.database && params.database !== '0') {
          connStr += `/${params.database}`;
        }
        break;

      case 'sqlite':
        connStr = `sqlite://${params.database || ':memory:'}`;
        break;

      case 'mssql':
        connStr = `mssql://${params.username}:${params.password}@${params.host}:${params.port}/${params.database}`;
        const mssqlParams = [];
        if (params.ssl) mssqlParams.push('encrypt=true');
        if (mssqlParams.length > 0) {
          connStr += '?' + mssqlParams.join('&');
        }
        break;

      case 'oracle':
        connStr = `oracle://${params.username}:${params.password}@${params.host}:${params.port}/${params.database}`;
        break;
    }

    // Add additional parameters
    if (params.additionalParams.length > 0) {
      const validParams = params.additionalParams.filter(p => p.key && p.value);
      if (validParams.length > 0) {
        const separator = connStr.includes('?') ? '&' : '?';
        connStr += separator + validParams.map(p => `${p.key}=${p.value}`).join('&');
      }
    }

    setConnectionString(connStr);
  };

  const loadExample = () => {
    switch (dbType) {
      case 'postgresql':
        setParams({
          host: 'db.example.com',
          port: '5432',
          database: 'myapp_production',
          username: 'postgres',
          password: 'secretpassword',
          ssl: true,
          additionalParams: [
            { key: 'connect_timeout', value: '10' },
            { key: 'application_name', value: 'myapp' }
          ],
        });
        break;
      case 'mongodb':
        setParams({
          host: 'cluster0.mongodb.net',
          port: '27017',
          database: 'myapp',
          username: 'appuser',
          password: 'strongpassword',
          ssl: true,
          authSource: 'admin',
          replicaSet: 'atlas-abc123-shard-0',
          additionalParams: [
            { key: 'retryWrites', value: 'true' },
            { key: 'w', value: 'majority' }
          ],
        });
        break;
      default:
        setParams({
          ...params,
          host: 'localhost',
          port: defaultPorts[dbType],
          database: 'testdb',
          username: 'user',
          password: 'password',
          ssl: false,
          additionalParams: [],
        });
    }
  };

  // Update port when database type changes
  const handleDbTypeChange = (newType: DatabaseType) => {
    setDbType(newType);
    updateParam('port', defaultPorts[newType]);
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
              <Link className="w-5 h-5" />
            </motion.div>
            <span>Connection String Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Database Type */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Database Type</label>
              <Select value={dbType} onValueChange={handleDbTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="mssql">SQL Server</SelectItem>
                  <SelectItem value="oracle">Oracle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadExample}
              className="self-end animate-pulse-hover"
            >
              Load Example
            </Button>
          </div>

          {/* Connection Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dbType !== 'sqlite' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Host</label>
                  <Input
                    value={params.host}
                    onChange={(e) => updateParam('host', e.target.value)}
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Port</label>
                  <Input
                    value={params.port}
                    onChange={(e) => updateParam('port', e.target.value)}
                    placeholder={defaultPorts[dbType]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    value={params.username}
                    onChange={(e) => updateParam('username', e.target.value)}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={params.password}
                      onChange={(e) => updateParam('password', e.target.value)}
                      placeholder="password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Database Name</label>
              <Input
                value={params.database}
                onChange={(e) => updateParam('database', e.target.value)}
                placeholder={dbType === 'sqlite' ? '/path/to/database.db' : 'database_name'}
              />
            </div>

            {dbType === 'mongodb' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auth Source</label>
                  <Input
                    value={params.authSource}
                    onChange={(e) => updateParam('authSource', e.target.value)}
                    placeholder="admin"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Replica Set</label>
                  <Input
                    value={params.replicaSet}
                    onChange={(e) => updateParam('replicaSet', e.target.value)}
                    placeholder="rs0"
                  />
                </div>
              </>
            )}
          </div>

          {/* SSL Option */}
          {dbType !== 'sqlite' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ssl"
                checked={params.ssl}
                onCheckedChange={(checked) => updateParam('ssl', !!checked)}
              />
              <label
                htmlFor="ssl"
                className="text-sm font-medium cursor-pointer"
              >
                Enable SSL/TLS
              </label>
            </div>
          )}

          {/* Additional Parameters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Additional Parameters</label>
              <Button
                size="sm"
                variant="outline"
                onClick={addAdditionalParam}
                className="animate-pulse-hover"
              >
                Add Parameter
              </Button>
            </div>
            <AnimatePresence>
              {params.additionalParams.map((param, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex gap-2"
                >
                  <Input
                    value={param.key}
                    onChange={(e) => updateAdditionalParam(index, 'key', e.target.value)}
                    placeholder="parameter"
                    className="flex-1"
                  />
                  <Input
                    value={param.value}
                    onChange={(e) => updateAdditionalParam(index, 'value', e.target.value)}
                    placeholder="value"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeAdditionalParam(index)}
                  >
                    ×
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateConnectionString}
            className="w-full animate-pulse-hover"
          >
            Generate Connection String
          </Button>

          {/* Generated Connection String */}
          <AnimatePresence>
            {connectionString && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Connection String</label>
                  <CopyButton text={connectionString} />
                </div>
                <div className="p-4 bg-muted rounded-lg break-all">
                  <code className="text-sm">{connectionString}</code>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Common Formats */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="text-sm font-medium">Common Connection String Formats:</h3>
            <ul className="text-xs text-muted-foreground space-y-1 font-mono">
              <li>PostgreSQL: postgresql://user:pass@host:5432/db</li>
              <li>MySQL: mysql://user:pass@host:3306/db</li>
              <li>MongoDB: mongodb://user:pass@host:27017/db</li>
              <li>Redis: redis://:pass@host:6379/0</li>
              <li>SQLite: sqlite:///path/to/database.db</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}