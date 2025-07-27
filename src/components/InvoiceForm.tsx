return (
  <FormProvider {...methods}>
    <div className="p-4">
      <form onSubmit={methods.handleSubmit(() => {})}>
        <div className="min-h-screen space-y-6">
          
          {/* Modern Header Section */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 rounded-3xl shadow-2xl shadow-purple-500/30 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Invoice Generator</h1>
                <p className="text-purple-100 text-lg">Create professional invoices with ease</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                  <div className="text-sm text-purple-100 mb-1">Mode</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('MM')}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        mode === 'MM' 
                          ? 'bg-white text-purple-600 shadow-lg' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      MM
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('FI')}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        mode === 'FI' 
                          ? 'bg-white text-purple-600 shadow-lg' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      FI
                    </button>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                  <div className="text-sm text-purple-100 mb-1">Template</div>
                  <select 
                    value={template} 
                    onChange={(e) => setTemplate(e.target.value as TemplateName)}
                    className="bg-white/20 text-white rounded-lg px-3 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="businessstandard" className="text-gray-900">Business Standard</option>
                    <option value="classic" className="text-gray-900">Classic</option>
                    <option value="professional" className="text-gray-900">Professional</option>
                    <option value="businessgreen" className="text-gray-900">Business Green</option>
                    <option value="allrauer2" className="text-gray-900">Allrauer</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Left Sidebar - Progress & Quick Actions */}
            <div className="xl:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Progress Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Progress
                  </h3>
                <EnhancedStepsProgress
                  completedSteps={stepTracking.completedSteps}
                  currentStep={stepTracking.currentStep || undefined}
                  orientation="vertical"
                />
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsVendorModalOpen(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      + Add Vendor
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreditorModalOpen(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      + Add Recipient
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBulkMaterialModalOpen(true)}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      + Add Materials
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVersionsModalOpen(true)}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      📁 Versions
                    </button>
                  </div>
                </div>

                {/* Demo Data Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
                  <h3 className="font-bold text-purple-900 mb-3">Demo Data</h3>
                  <DemoDataFiller
                    mode={mode}
                    vendors={vendors}
                    recipients={recipients}
                    materials={materials}
                    currentVendorId={methods.watch('vendorId')}
                    currentRecipientId={methods.watch('recipientId')}
                    onFillData={handleFillDemoData}
                  />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    Invoice Details
                  </h2>
                </div>
                <div className="p-6">
                  <InvoiceBasicInfo mode={mode} vendors={vendors} recipients={recipients} />
                </div>
              </div>

              {/* Logo Configuration Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    Logo & Branding
                  </h2>
                </div>
                <div className="p-6">
                  <LogoUpload 
                    onSuccess={(selectedLogo) => {
                      setLogo(selectedLogo);
                      const defaultConfig = {
                        maxWidth: 200,
                        maxHeight: 60,
                        alignment: 'right'
                      };
                      setLogoConfig(defaultConfig);
                    }}
                    onDialogChange={setIsLogoDialogOpen}
                    onLogoConfigChange={setLogoConfig}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                      </div>
                      Invoice Items
                    </h2>
                    {mode === 'MM' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sync-materials"
                          checked={syncMaterials}
                          onChange={(e) => setSyncMaterials(e.target.checked)}
                          className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="sync-materials" className="text-sm font-medium text-gray-700">
                          Sync Materials
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <InvoiceFormContent
                    mode={mode}
                    syncMaterials={syncMaterials}
                    setSyncMaterials={setSyncMaterials}
                    logo={logo}
                    setLogo={setLogo}
                    logoConfig={logoConfig}
                    setLogoConfig={setLogoConfig}
                    setIsLogoDialogOpen={setIsLogoDialogOpen}
                    vendors={vendors}
                    recipients={recipients}
                    invoiceItems={invoiceItems}
                    setInvoiceItems={setInvoiceItems}
                    orderItems={orderItems}
                    setOrderItems={setOrderItems}
                    deliveryItems={deliveryItems}
                    setDeliveryItems={setDeliveryItems}
                    fiItems={fiItems}
                    setFIItems={setFIItems}
                    filteredMaterials={filteredMaterials}
                    getTaxCodeInfo={getTaxCodeInfo}
                    template={template}
                    methods={methods}
                    pdfBlob={pdfBlob}
                    isPreviewLoading={isPreviewLoading}
                    previewDocument={previewDocument}
                    handlePreviewPDF={handlePreviewPDF}
                    handlePreviewMMPDF={handlePreviewMMPDF}
                    handleDownloadXML={handleDownloadXML}
                    handleDownloadPDF={handleDownloadPDF}
                    handleCreateMMDocument={handleCreateMMDocument}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar - PDF Preview */}
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </div>
                      PDF Preview
                    </h2>
                  </div>
                  <div className="p-6">
                    <InvoiceFormActions
                      mode={mode}
                      template={template}
                      vendors={vendors}
                      recipients={recipients}
                      methods={methods}
                      pdfBlob={pdfBlob}
                      isPreviewLoading={isPreviewLoading}
                      previewDocument={previewDocument}
                      handlePreviewPDF={handlePreviewPDF}
                      handlePreviewMMPDF={handlePreviewMMPDF}
                      handleDownloadXML={handleDownloadXML}
                      handleDownloadPDF={handleDownloadPDF}
                      handleCreateMMDocument={handleCreateMMDocument}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
            Retry Connection
   if (hasError) {
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
       </div>
   }