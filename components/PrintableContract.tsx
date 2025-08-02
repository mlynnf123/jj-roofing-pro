
import React from 'react';
import Image from 'next/image';
import { Lead } from '../types';

interface PrintableContractProps {
  lead: Lead;
  onClose: () => void;
}

const PrintableContract: React.FC<PrintableContractProps> = ({ lead, onClose }) => {
  if (!lead.contract) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error: Contract Data Missing</h2>
          <p className="mb-6 text-slate-700">Cannot display contract preview because contract data is not available for this lead.</p>
          <button
            onClick={onClose}
            className="w-full bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { contract, firstName, lastName, address } = lead;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:bg-white print:p-0">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20px; /* Adjust as needed for actual contract layout */
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col printable-area">
        <div className="p-6 border-b border-slate-300 no-print">
          <h2 className="text-2xl font-semibold text-slate-800">Contract Preview: {firstName} {lastName}</h2>
        </div>

        {/* Official Contract Content - Multi-Page */}
        <div className="overflow-y-auto flex-grow custom-scrollbar">
          
          {/* PAGE 1 - Main Contract */}
          <div className="p-6 text-xs leading-tight print:break-after-page">
            {/* Header with Logo and Company Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image 
                  src="/Austin, TX.png" 
                  alt="JJ Roofing Logo" 
                  width={60} 
                  height={60}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold">J Roofing Pros LLC</h1>
                  <p className="text-xs">Corporate Headquarters</p>
                  <p className="text-xs"><strong>Send Payment To:</strong> 14205 N MO PAC EXPY STE 570</p>
                  <p className="text-xs">AUSTIN, TX 78728</p>
                  <p className="text-xs">(737) 414 - 1929</p>
                  <p className="text-xs">www.JJRoofers.com</p>
                </div>
              </div>
            </div>

            {/* Customer and Company Representative */}
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div>
                <h3 className="font-bold mb-2">Customer</h3>
                <p>{contract.customerName || `${firstName} ${lastName}`}</p>
                <p>{contract.customerAddress || address}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Company Representative</h3>
                <p>{contract.companyRepresentativeName || "Justin Cox"}</p>
                <p>{contract.companyRepresentativePhone || "(737) 414-1929"}</p>
                <p>{contract.companyRepresentativeEmail || "Justin@JJroofers.com"}</p>
              </div>
            </div>

            {/* Work Description Table */}
            <table className="w-full border border-black text-xs mb-4">
              <thead>
                <tr>
                  <th className="border border-black p-1 text-left">Description</th>
                  <th className="border border-black p-1 text-center">Quantity</th>
                  <th className="border border-black p-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold">ROOFING</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr>
                  <td className="border border-black p-1">
                    Lifetime | Standing Seam Metal<br/>
                    -Synthetic Felt<br/>
                    -Ridge<br/>
                    -Ice & Water Barrier<br/>
                    -Drip Edge Installed (Painted to Match Shingle)<br/>
                    -Plumbing Boots (Painted to Match Roof)<br/>
                    -Ventilation Replaced/Reconditioned & Painted<br/>
                    -All Debris Removed & Site Cleaned, Swept of Metals, Nails, etc.<br/>
                    JJ Roofing Pros LLC LIFETIME WORKMANSHIP warranty<br/>
                    <strong>****Line items above are products JJ Roofing Pros LLC is providing to the customer and is not an upgrade request to insurance.****</strong>
                  </td>
                  <td className="border border-black p-1 text-center">1</td>
                  <td className="border border-black p-1 text-right">{contract.grandTotal}</td>
                </tr>
                {contract.roofingItems && contract.roofingItems.map(item => (
                  <tr key={item.id}>
                    <td className="border border-black p-1">{item.description}</td>
                    <td className="border border-black p-1 text-center">{item.quantity}</td>
                    <td className="border border-black p-1 text-right">{item.price}</td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-black p-1 font-bold">Gutters</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
                {contract.gutterItems && contract.gutterItems.map(item => (
                  <tr key={item.id}>
                    <td className="border border-black p-1">{item.description}</td>
                    <td className="border border-black p-1 text-center">{item.quantity}</td>
                    <td className="border border-black p-1 text-right">{item.price}</td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-black p-1 font-bold">Windows</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
                {contract.windowItems && contract.windowItems.map(item => (
                  <tr key={item.id}>
                    <td className="border border-black p-1">{item.description}</td>
                    <td className="border border-black p-1 text-center">{item.quantity}</td>
                    <td className="border border-black p-1 text-right">{item.price}</td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-black p-1 text-right font-bold">Subtotal</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 text-right">{contract.subtotal}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-right font-bold">Total</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 text-right">{contract.total}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-right font-bold">Grand Total:</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 text-right font-bold">{contract.grandTotal}</td>
                </tr>
              </tbody>
            </table>

            {/* Payment Schedule */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">PAYMENT SCHEDULE</h3>
              <p className="mb-1">First Payment (Due upon Start of Job/Material Delivery)</p>
              <p className="mb-1">Second Payment (Due upon Completion of Roof)</p>
              <p className="mb-1">Final Payment (Due upon Job Completion *INS INVOICE* Final pmnt may increase based on approved supplements)</p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <p className="mb-4">Company Authorized Signature _________________ Date _______</p>
              </div>
              <div>
                <p className="mb-4">Customer Signature 1 _________________ Date _______</p>
              </div>
            </div>

            <p className="text-center text-xs mt-4">Page 1 of 8</p>
          </div>

          {/* PAGE 2 - Contract Worksheet */}
          <div className="p-6 text-xs leading-tight print:break-after-page">
            <h2 className="text-lg font-bold text-center mb-4">CONTRACT WORKSHEET</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="w-32">Deductible:</span>
                <span className="border-b border-black w-20 text-center">{contract.deductible || "0"}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-32">Non-Recoverable Depreciation</span>
                <span className="border-b border-black w-20 text-center">{contract.nonRecoverableDepreciation || ""}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-32">Upgrades:</span>
                <span className="border-b border-black flex-1 ml-2">{contract.upgrades || "Standing Seam Metal, SYNTHETIC UL, I&W, LIFETIME WARRANTY"}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-32">Discounts:</span>
                <span className="border-b border-black w-20 text-center">{contract.discounts || "0"}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-32">Work Not Doing:</span>
                <span className="border-b border-black flex-1 ml-2">{contract.workNotDoing || "GUTTERS, BEADING"}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-32">Remaining Balance On Deductible and Upgrades:</span>
                <span className="border-b border-black w-20 text-center ml-2">{contract.remainingBalanceOnDeductibleAndUpgrades || "0"}</span>
              </div>
            </div>

            {/* Recovering Withheld Depreciation Section */}
            <div className="mt-6">
              <h3 className="font-bold mb-2">Recovering Withheld Depreciation and Supplements</h3>
              <div className="text-xs space-y-2">
                <p>Your insurance company has depreciated items on your claim. In order to recover the depreciation, a final invoice is sent to your insurance company. In the event that items were missing from your original estimate, JJ Roofing Pros LLC. (JJR) has also applied for supplemental items with your insurance company. These supplemental items, if any, are included on the insurance invoice and in the final invoice total. Below are the steps you will need to take to ensure your recoverable depreciation and supplements are released from your insurance company:</p>
                
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Have your claim number available.</li>
                  <li>Call your insurance company to confirm they have received the final invoice from JJR. If they claim to have not received the invoice, send them a copy of your invoice.</li>
                  <li>Make sure to get the contact info for the adjuster who is processing your claim. This will most likely be a different adjuster than the one who inspected your house originally.</li>
                  <li>Confirm everything is complete with the handling adjuster and ask them to release the recoverable deprecation and any applied for supplements. If requested, some insurance companies can direct deposit the funds. Otherwise, the check will take between 5-7 business days to receive.</li>
                  <li>If they have any question regarding supplements or the final invoice, please direct them to Admin@JJRoofers.com.</li>
                  <li>Follow up with the handling adjuster within 3 business days to confirm payment has been processed and mailed to you.</li>
                  <li>You may have to follow up several times to expedite the process. Insurance companies can get very busy and it helps to stay on top of them to ensure your funds get released in a timely manner.</li>
                  <li>Once you have received the remaining funds, call your JJR Representative to pay any balances owed and to schedule any remaining trades.</li>
                  <li>You may pay by personal check, cashiers check, credit card (1% processing fee) made payable to JJ Roofing Pros LLC.</li>
                </ol>
                
                <p className="mt-4">For Invoice Questions, contact your JJR Sales Representative, or call the JJR Billing Department at (737) 414-1929. For Supplement Questions, contact your JJR Sales Representative, (737) 414-1929, or Admin@JJRoofers.com. Please sign below, indicating that you have read and understand the Insurance Contract Worksheet and the Recovering of Withheld Depreciation and Supplements.</p>
                
                <p className="mt-4">All insurance approved supplements and recoverable depreciation will be due to JJ Roofing Pros LLC. Customer agrees to fully cooperate with any necessary paperwork needed to seek supplement and recoverable depreciation approval, and has no claim to any supplemental funds or recoverable depreciation. If Customer does not cooperate with these requests, the additional supplements and recoverable depreciation will be due at the sole responsibility of Customer. Any supplements that are denied by the insurance provider will not be the responsibility of the customer.</p>
              </div>
            </div>

            <p className="text-center text-xs mt-6">Page 2 of 8</p>
          </div>

          {/* PAGE 3 - Work Completed Per Insurance Scope */}
          <div className="p-6 text-xs leading-tight print:break-after-page">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Work Completed Per Insurance Scope</h3>
                <p>All work will be performed per detailed line item scope listed on insurance paperwork except for the items listed in the "work not doing" section, chimney flashing, flue caps and chase covers will be inspected for damage and replaced strictly on an as needed basis. "Work not doing" totals will directly correlate to line items in the Scope of work provided by the insurance company. According to this contract, this work will not be done by JJR. Customer may be required to complete this work by their mortgage provider and/or insurance company. This work will be the sole responsibility of Customer and does not allow for any deductions from the contracted amount. Any additional work will need to be in writing. No work will be done to your property without a written agreement and payment terms will not be made based on verbal agreements.</p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Discounts</h3>
                <p>Any discounts offered to you by JJR may be due to your insurance company per your insurance policy agreement. JJR is not responsible for any agreements you have with your insurance company and will not be responsible for paying any amounts due to your insurance company as a result of your agreements. If your payment terms are not honored, all discounts offered to you will be revoked at the sole discretion of JJR. See Late Payments and Penalties for further details.</p>
              </div>

              <p className="mt-6">By signing below, you acknowledge that you have read and agree to the terms of this Insurance Contract Worksheet.</p>
              
              <div className="mt-4">
                <p>Customer Signature 2 _________________________ Date _______</p>
              </div>
            </div>

            <p className="text-center text-xs mt-8">Page 3 of 8</p>
          </div>

          {/* PAGE 4 - Contract Terms and Review Items */}
          <div className="p-6 text-xs leading-tight print:break-after-page">
            <h2 className="text-lg font-bold text-center mb-4">JJ Roofing Pros LLC. Roofing Contract & Payment Terms</h2>
            
            <p className="mb-4">With this contract, JJ Roofing Pros LLC. sets forth the agreement between JJ Roofing Pros LLC. (hereinafter "JJR") and "{contract.customerName || `${firstName} ${lastName}`}" (hereinafter "Customer") to establish the working terms for work to be completed at {contract.customerAddress || address}. In addition to the working terms, this contract also establishes the agreed upon payment schedule between JJR and Customer.</p>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Please Review and Initial the Below Items:</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="border border-black w-16 h-4 mr-2 flex-shrink-0"></span>
                  <span>Shingle Type/Color/Delivery Instructions: {contract.shingleTypeColorDelivery || "Shingles | Lifetime | IKO Dynasty | Duration Class 3 / None / None"}</span>
                </div>
                <div className="flex items-start">
                  <span className="border border-black w-16 h-4 mr-2 flex-shrink-0"></span>
                  <span>Existing Property Damage (Fascia Rot, Driveway Cracks,etc.): {contract.existingPropertyDamage || "None"}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Liability Disclosure Addendum</h3>
              <p className="mb-2">Initial Below:</p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="border border-black w-12 h-4 mr-2 flex-shrink-0"></span>
                  <span>I understand that this is a construction site, and agree to use caution when entering and exiting my property and to ensure the safety of my family members, friends, children and pets on the premises. I understand and accept the risks of falling debris and errant nails. It is my responsibility to use reasonable caution and I agree to release and hold harmless JJ Roofing Pros LLC., of any responsibility for any injury, damage to property or death that may occur due in part or in whole to any negligence on my part. I understand it is my responsibility to secure any items in my home that may be fragile or might fall resulting in injury or death. Any damage to any items is the sole responsibility of Customer.</span>
                </div>
                <div className="flex items-start">
                  <span className="border border-black w-12 h-4 mr-2 flex-shrink-0"></span>
                  <span>All JJR vehicles are rated for driveway usage and any damage and/or cracks resulting from routine driveway usage and/or parking in the driveway to complete the job is not the responsibility of JJ Roofing Pros LLC.</span>
                </div>
                <div className="flex items-start">
                  <span className="border border-black w-12 h-4 mr-2 flex-shrink-0"></span>
                  <span>I understand that any punctured lines are not the responsibility of JJ Roofing Pros LLC. during the installation process. Code provides for installation standards for roofing and all code standards are followed by JJR. In the event that an electric, HVAC, Plumbing, etc. line is damaged during the installation process, it is the sole responsibility of Customer to repair.</span>
                </div>
                <div className="flex items-start">
                  <span className="border border-black w-12 h-4 mr-2 flex-shrink-0"></span>
                  <span>I have read and understand the terms on the reverse side of this document.</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Right of Rescission and Property Disclosure</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <p>Under Texas State Law, you have the right to cancel this contract within three business days of the contract date. By initialing here I confirm that I have been informed of the "three-day right of rescission law" and have been provided with 2 copies of this contract and the cancellation information found on the reverse side of contract titled "notice of cancellation"</p>
                  <span className="border border-black w-16 h-4 ml-2 flex-shrink-0"></span>
                </div>
                <div className="flex items-start">
                  <p>Disclosure By initialing here I confirm that I have previously received the disclosures required by Texas Property Code §53.255 for the execution of residential construction contracts</p>
                  <span className="border border-black w-16 h-4 ml-2 flex-shrink-0"></span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p>Cancellation I choose to cancel this contract Customer Signature_____________________________Date_______</p>
            </div>

            <p className="text-center text-xs mt-8">Page 4 of 8</p>
          </div>

          {/* PAGE 5 - Additional Terms */}
          <div className="p-6 text-xs leading-tight print:break-after-page">
            <div className="space-y-4">
              <p><strong>Terms</strong> I understand that a JJR Representative is available upon request to inspect all furnace vent connections that may become unattached during the roofing process. I understand it is my responsibility to ensure these connections are secure or request a JJR Representative to inspect the crucial connections, so that Carbon Monoxide does not enter my dwelling. I agree that this is my responsibility to ensure the safety of my family and agree to hold harmless JJ Roofing Pros LLC. of all liability associated with Carbon Monoxide and/or furnace vent connections. I further understand that Carbon Monoxide is a deadly Gas and Serious injury or death may occur as a result of furnace vents becoming disconnected.</p>

              <p>In the event of rotten decking, JJR will replace up to three (3) sheets of decking at no additional cost to Customer, if there is a widespread decking issue, the decking will need to be replaced at the expense of Customer. Not replacing rotten decking will void your manufacturer warranty as well as your Lifetime Workmanship Warranty from JJR. It is at the discretion of the JJR Roofing Crew to remove all felted areas on your roof. New felt may be placed over existing felt in some areas. A thorough inspection of existing decking is still conducted of any areas with an additional felt layer.</p>

              <p>A new roofing system will not remedy existing issues to framing, decking, fascia or soffit. If agreed upon in writing in the special instructions above, any of these type of repairs can be made at the expense and request of Customer prior to the installation of the roof. However, these repairs are not a part of the insurance claim unless otherwise noted and repairs to these items cannot be completed after the installation of the roofing system.</p>

              <p><strong>Venue</strong> all suits arising out of or related to this agreement shall be filed in the courts of the county of residence.</p>

              <p><strong>Warranty</strong> JJR includes a Lifetime Workmanship Warranty on all JJR roofing systems, which protects against poor workmanship. JJR is not responsible for normal wear and tear. See complete warranty information for details. Warranty begins upon payment in full of total contract amount and approved supplements warranty will be voided by unpaid contract. Warranty is voided due to damages caused by a named storm/ acts of God that goes through your area.</p>

              <p><strong>Payments</strong> First roof payment is due when materials are delivered and the crew has started work. Failure to make first payment may result in work stoppage. JJ Roofing Pros LLC. is not liable for damages that may occur due to work stoppage for failure to make initial contract payment to property. This includes but is not limited to flooding, water damage, theft of material, etc. Final roof payment is due to JJR upon roof completion any and all trade payments are due upon completion of trade. Final payments not received within 30 days of completion will be considered failure to pay and will be subject to Failure to Pay Penalties. See Failure to Pay Penalties for further details.</p>

              <p><strong>Failure to Pay Penalties</strong> 10% penalty assessed against the total remainder due, all discounts will be revoked at the sole discretion of JJR and the account is subject to being sent to a 3rd party collections agency. Failure to pay may also result in Theft of Service charges being filed per Texas Penal Code § 31.04 in addition to any necessary civil remedies.</p>

              <p><strong>Notice of Cancellation for Contract</strong> If I choose to exercise my three-day Right of Rescission, I understand that by signing and dating in the space provided will make this contract null and void and no work will be provided by JJR. I understand it is my responsibility to mail 1 copy of this cancelled contract to the corporate office of JJ Roofing Pros LLC. to Send Payment To: 14205 N MO PAC EXPY STE 570 Austin, TX 78728 or to post marked or time stamped no later than midnight on the Third business day upon the date that this contract was executed. In the event that your insurance company denies a filed claim a pre-contract will be cancelled with proof of denial. Contracts cancelled outside of this period may result in a restocking fee not to exceed 25% of the total contracted amount.</p>

              <p><strong>Note:</strong> JJR Sales Representatives do not make verbal contracts and any terms not disclosed on a contract are considered null and void.</p>

              <p>JJ Roofing Pros LLC is not responsible for any money not released due to lapsed claim of time, out of date policies or negligence to complete work within one year of date of loss. By signing the contract, you agree to pay in full all completed work, regardless of insurance release of money due to your policy terms.</p>

              <div className="mt-6">
                <p>Customer Signature _________________________ Date _______</p>
              </div>

              <p className="mt-4">JJ Roofing Pro LLC is not responsible for any money held by mortgage company, nor shall their timeframe of releases apply to JJ Roofing Pros LLC. By signing this contract, you agree to pay upon the agreed and signed payment terms, regardless of your mortgage terms/ mortgage money holds.</p>

              <div className="mt-4">
                <p>Customer Signature _________________________ Date _______</p>
              </div>

              <p className="mt-4">We accept personal checks, money orders, cashiers checks or credit cards. (Make checks payable to JJ Roofing Pro LLC. ) There is a 1% processing fee for credit card transactions. Returned checks will result in a returned check fee of $50 and/or potential hot check charges filed with the appropriate authorities.</p>

              <p className="mt-4"><strong>*** law requires a person insured under a property insurance policy to pay any deductible applicable to a claim made under the policy. It is a violation of law for a seller of goods or services who reasonably expects to be paid wholly or partly from the proceeds of a property insurance claim to knowingly allow the insured person to fail to pay, or assist the insured person's failure to pay, the applicable insurance deductible. ***</strong></p>

              <div className="mt-6">
                <p>Customer Signature 3 _________________________ Date _______</p>
              </div>
            </div>

            <p className="text-center text-xs mt-8">Page 5 of 8</p>
          </div>

          {/* PAGE 6 - Third Party Authorization Form */}
          <div className="p-6 text-xs leading-tight print:break-after-page">
            <h2 className="text-lg font-bold text-center mb-4">Third Party Authorization Form</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex">
                <span className="w-32">Homeowner Name(s):</span>
                <span className="border-b border-black flex-1">{contract.thirdPartyAuthHomeownerName || contract.customerName || `${firstName} ${lastName}`}</span>
              </div>
              <div className="flex">
                <span className="w-32">Property Address:</span>
                <span className="border-b border-black flex-1">{contract.thirdPartyAuthPropertyAddress || contract.customerAddress || address}</span>
              </div>
              <div className="flex">
                <span className="w-32">Insurance Company:</span>
                <span className="border-b border-black flex-1">{contract.thirdPartyAuthInsuranceCompany || lead.claimCompany || ""}</span>
              </div>
              <div className="flex">
                <span className="w-32">Claim Number:</span>
                <span className="border-b border-black flex-1">{contract.thirdPartyAuthClaimNumber || lead.claimNumber || ""}</span>
              </div>
            </div>

            <p className="mb-4">I/We, ______________________, authorize the following third party, JJ Roofing Pros LLC. the following type(s) of authorization(s) regarding my claim:</p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center">
                <span className="border border-black w-4 h-4 mr-2"></span>
                <span>Request Inspections</span>
              </div>
              <div className="flex items-center">
                <span className="border border-black w-4 h-4 mr-2"></span>
                <span>Discuss and Request Supplements</span>
              </div>
              <div className="flex items-center">
                <span className="border border-black w-4 h-4 mr-2"></span>
                <span>Issued payment discussions and all insurance paperwork discussions.</span>
              </div>
              <div className="flex items-center">
                <span className="border border-black w-4 h-4 mr-2"></span>
                <span>Request Claim Payment Status (Recoverable Depreciation & Supplements)</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Overhead & Profit</h3>
              <p className="mb-2">Understanding the time, effort, energy and supervision necessary for the restoration of my project, I do not have the time nor the resources to coordinate or manage this project to completion. Therefore, this statement is to inform you that my contractor of choice, JJ Roofing Pros LLC, is my general contractor, and they will be managing and coordinating all subcontractors and projects required to complete the repair of my property.</p>
              
              <p className="mb-2">Therefore, overhead & profit should be included in my estimate due to the following reasons:</p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>JJ Roofing Pros LLC. is a general contractor</li>
                <li>They will directly hire and coordinate all subcontractors required to complete my project</li>
                <li>As a general contractor coordinating the trades and work, they have overhead costs not connected to specific line items on the estimate. JJ Roofing Pros LLC. must include overhead and profit to provide their contracting services to stay in business, as they have expenses and overhead above and beyond the normal expenses of laborer who does the work themselves.</li>
              </ol>
              
              <p className="mt-2">Please speak directly with JJ Roofing Pros LLC. regarding any questions. You can reach them at {contract.companyRepresentativePhone || "(737) 414-1929"} or {contract.companyRepresentativeEmail || "Justin@JJroofers.com"}.</p>
            </div>

            <div className="mt-8">
              <p>Customer Signature 4 _________________________ Date _______</p>
            </div>

            <p className="text-center text-xs mt-8">Page 6 of 8</p>
          </div>

          {/* PAGES 7-8 would contain additional terms, conditions, and legal text */}
          <div className="p-6 text-xs leading-tight print:break-after-page">
            <h2 className="text-lg font-bold text-center mb-4">Additional Terms and Conditions</h2>
            <p className="text-center text-slate-600 mb-4">Pages 7-8 would contain additional legal terms, warranty details, and conditions as specified in your complete contract.</p>
            
            <div className="flex items-center justify-center h-64 bg-slate-50 rounded border-2 border-dashed border-slate-300">
              <p className="text-slate-500 text-center">Additional contract pages content would be inserted here<br/>based on your complete 8-page contract template</p>
            </div>

            <p className="text-center text-xs mt-8">Pages 7-8 of 8</p>
          </div>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-300 flex justify-end space-x-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md shadow-sm transition-colors"
          >
            Close Preview
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
          >
            Print Contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintableContract;
