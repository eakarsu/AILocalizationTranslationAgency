import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CrudPage from './pages/CrudPage';
import AIPage from './pages/AIPage';
import AIHistory from './pages/AIHistory';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) setUser(JSON.parse(savedUser));
  }, [token]);

  const handleLogin = (userData, tokenData) => {
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<CrudPage title="Projects" endpoint="/projects" fields={projectFields} />} />
          <Route path="/clients" element={<CrudPage title="Clients" endpoint="/clients" fields={clientFields} />} />
          <Route path="/translators" element={<CrudPage title="Translators" endpoint="/translators" fields={translatorFields} />} />
          <Route path="/languages" element={<CrudPage title="Language Pairs" endpoint="/languages" fields={languageFields} />} />
          <Route path="/glossary" element={<CrudPage title="Glossary" endpoint="/glossary" fields={glossaryFields} />} />
          <Route path="/orders" element={<CrudPage title="Translation Orders" endpoint="/orders" fields={orderFields} />} />
          <Route path="/invoices" element={<CrudPage title="Invoices" endpoint="/invoices" fields={invoiceFields} />} />
          <Route path="/files" element={<CrudPage title="Translation Files" endpoint="/files" fields={fileFields} />} />
          <Route path="/ai/translate" element={<AIPage type="translate" />} />
          <Route path="/ai/localize" element={<AIPage type="localize" />} />
          <Route path="/ai/grammar" element={<AIPage type="grammar" />} />
          <Route path="/ai/terminology" element={<AIPage type="terminology" />} />
          <Route path="/ai/tm" element={<AIPage type="tm" />} />
          <Route path="/ai/quality" element={<AIPage type="quality" />} />
          <Route path="/ai/cultural" element={<AIPage type="cultural" />} />
          <Route path="/ai/seo" element={<AIPage type="seo" />} />
          <Route path="/ai/back-translation" element={<AIPage type="backTranslation" />} />
          <Route path="/ai/sentiment" element={<AIPage type="sentiment" />} />
          <Route path="/ai/lang-detect" element={<AIPage type="langDetect" />} />
          <Route path="/ai/readability" element={<AIPage type="readability" />} />
          <Route path="/ai/style-transfer" element={<AIPage type="styleTransfer" />} />
          <Route path="/ai/summarize" element={<AIPage type="summarize" />} />
          <Route path="/ai/brand-voice" element={<AIPage type="brandVoice" />} />
          <Route path="/ai/subtitles" element={<AIPage type="subtitles" />} />
          <Route path="/ai/doc-compare" element={<AIPage type="docCompare" />} />
          <Route path="/ai/competitor" element={<AIPage type="competitor" />} />
          <Route path="/ai/project-analyzer" element={<AIPage type="projectAnalyzer" />} />
          <Route path="/ai/client-insights" element={<AIPage type="clientInsights" />} />
          <Route path="/ai/translator-matcher" element={<AIPage type="translatorMatcher" />} />
          <Route path="/ai/glossary-gen" element={<AIPage type="glossaryGen" />} />
          <Route path="/ai/order-optimizer" element={<AIPage type="orderOptimizer" />} />
          <Route path="/ai/invoice-analyzer" element={<AIPage type="invoiceAnalyzer" />} />
          <Route path="/ai/bias-check" element={<AIPage type="biasCheck" />} />
          <Route path="/ai/generate-quote" element={<AIPage type="generateQuote" />} />
          <Route path="/ai-history" element={<AIHistory />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

const projectFields = [
  { name: 'name', label: 'Project Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'client_id', label: 'Client ID', type: 'number' },
  { name: 'source_language', label: 'Source Language', type: 'text' },
  { name: 'target_languages', label: 'Target Languages', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'review', 'completed', 'urgent'] },
  { name: 'deadline', label: 'Deadline', type: 'date' },
  { name: 'budget', label: 'Budget ($)', type: 'number' },
  { name: 'word_count', label: 'Word Count', type: 'number' },
  { name: 'project_type', label: 'Project Type', type: 'text' },
];

const clientFields = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'company', label: 'Company', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'country', label: 'Country', type: 'text' },
  { name: 'industry', label: 'Industry', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
];

const translatorFields = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'languages', label: 'Languages', type: 'text' },
  { name: 'specializations', label: 'Specializations', type: 'text' },
  { name: 'rate_per_word', label: 'Rate/Word ($)', type: 'number' },
  { name: 'rating', label: 'Rating', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: ['available', 'busy', 'unavailable'] },
  { name: 'country', label: 'Country', type: 'text' },
  { name: 'experience_years', label: 'Experience (years)', type: 'number' },
  { name: 'certifications', label: 'Certifications', type: 'text' },
];

const languageFields = [
  { name: 'source_language', label: 'Source Language', type: 'text', required: true },
  { name: 'target_language', label: 'Target Language', type: 'text', required: true },
  { name: 'rate_per_word', label: 'Rate/Word ($)', type: 'number' },
  { name: 'avg_delivery_days', label: 'Avg Delivery Days', type: 'number' },
  { name: 'available_translators', label: 'Available Translators', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
  { name: 'quality_tier', label: 'Quality Tier', type: 'select', options: ['standard', 'premium', 'enterprise'] },
];

const glossaryFields = [
  { name: 'term', label: 'Term', type: 'text', required: true },
  { name: 'definition', label: 'Definition', type: 'textarea' },
  { name: 'source_language', label: 'Source Language', type: 'text' },
  { name: 'target_language', label: 'Target Language', type: 'text' },
  { name: 'translation', label: 'Translation', type: 'text' },
  { name: 'domain', label: 'Domain', type: 'text' },
  { name: 'context', label: 'Context', type: 'textarea' },
  { name: 'approved', label: 'Approved', type: 'select', options: ['true', 'false'] },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const orderFields = [
  { name: 'project_id', label: 'Project ID', type: 'number' },
  { name: 'client_id', label: 'Client ID', type: 'number' },
  { name: 'translator_id', label: 'Translator ID', type: 'number' },
  { name: 'source_language', label: 'Source Language', type: 'text' },
  { name: 'target_language', label: 'Target Language', type: 'text' },
  { name: 'word_count', label: 'Word Count', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'review', 'completed', 'cancelled', 'urgent'] },
  { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'normal', 'high', 'urgent'] },
  { name: 'deadline', label: 'Deadline', type: 'date' },
  { name: 'total_cost', label: 'Total Cost ($)', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const invoiceFields = [
  { name: 'invoice_number', label: 'Invoice #', type: 'text', required: true },
  { name: 'client_id', label: 'Client ID', type: 'number' },
  { name: 'order_id', label: 'Order ID', type: 'number' },
  { name: 'amount', label: 'Amount ($)', type: 'number' },
  { name: 'tax', label: 'Tax ($)', type: 'number' },
  { name: 'total', label: 'Total ($)', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] },
  { name: 'due_date', label: 'Due Date', type: 'date' },
  { name: 'paid_date', label: 'Paid Date', type: 'date' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const fileFields = [
  { name: 'name', label: 'File Name', type: 'text', required: true },
  { name: 'project_id', label: 'Project ID', type: 'number' },
  { name: 'file_type', label: 'File Type', type: 'text' },
  { name: 'source_language', label: 'Source Language', type: 'text' },
  { name: 'target_language', label: 'Target Language', type: 'text' },
  { name: 'word_count', label: 'Word Count', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'translated', 'review', 'completed', 'urgent'] },
  { name: 'file_path', label: 'File Path', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export default App;
