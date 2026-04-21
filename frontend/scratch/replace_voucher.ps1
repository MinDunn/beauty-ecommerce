$filePath = "src/pages/Checkout.tsx"
$content = [System.IO.File]::ReadAllText($filePath)

# 1. Update Apply button ID
$content = $content -replace 'onClick=\{handleApplyCoupon\}', 'id="apply-coupon-btn" onClick={handleApplyCoupon}'

# 2. Add Voucher List
$listCode = @"
                    </div>

                    {/* Smart Voucher List */}
                    <CheckoutVoucherList 
                      vouchers={potentialVouchers} 
                      onSelect={handleSelectVoucher}
                      onOpenDrawer={() => setIsVoucherDrawerOpen(true)}
                      appliedCode={appliedCoupon?.code}
                    />
"@

# Match the </div> after the input block
$pattern = '(?s)(<div className="flex gap-2">.*?</div>)'
$content = [regex]::Replace($content, $pattern, $listCode)

# 3. Add VoucherDrawer at the end before </div> ); };
$drawerCode = @"
      {/* Voucher Selection Drawer */}
      <VoucherDrawer 
        isOpen={isVoucherDrawerOpen} 
        onClose={() => setIsVoucherDrawerOpen(false)} 
        onSelect={handleSelectVoucher}
      />
     </div>
"@

$pattern2 = '     </div>\s+?\)[:;]\s+?\};'
$content = [regex]::Replace($content, $pattern2, $drawerCode)

[System.IO.File]::WriteAllText($filePath, $content)
