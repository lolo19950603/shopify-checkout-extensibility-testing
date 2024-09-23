import {
  useExtensionApi,
  BlockSpacer,
  Divider,
  Heading,
  reactExtension,
  Checkbox,
  InlineStack,
  TextField,
  Select,
  useApplyAttributeChange,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";
import {
  provinceList,
  clinicsDataHomepharma,
  clinicsDataInfusion,
} from "../data/BillingAddresses.jsx";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const applyAttributeChange = useApplyAttributeChange();
  const { checkout } = useExtensionApi();
  console.log(checkout);

  // State to handle the checkboxes and inputs/dropdown
  const [isPssChecked, setIsPssChecked] = useState(false);
  const [isHomePharmaChecked, setIsHomePharmaChecked] = useState(false);
  const [isIcnChecked, setIsIcnChecked] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");

  // Check the current shipping address
  // const currentShippingAddress = checkout?.shippingAddress;

  // console.log('Current Shipping Address:', currentShippingAddress); // Debugging log

  // Function to handle province change
  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedClinic(""); // Reset clinic when province changes
  };

  // Function to handle clinic selection
  const handleClinicChange = (value) => {
    setSelectedClinic(value);
    if (isIcnChecked) {
      updateAddresses(value);
    }
  };

  const updateAddresses = async (clinicKey) => {
    const clinicData = clinicsDataInfusion[selectedProvince][clinicKey];
    if (clinicData) {
      // Update shipping address
      try {
        const result = await applyAttributeChange({
          key: 'shippingAddress',
          type: 'updateAttribute',
          value: JSON.stringify(clinicData),
        });
        console.log('Attribute change result:', result);
      } catch (error) {
        console.error('Error updating shipping address:', error);
      }

      // Update billing address
      try {
        const result = await applyAttributeChange({
          key: 'billingAddress',
          type: 'updateAttribute',
          value: JSON.stringify(clinicData),
        });
        console.log('Attribute change result:', result);
      } catch (error) {
        console.error('Error updating billing address:', error);
      }
    }
  };

  // Get the clinics based on the selected province and the checked clinic type
  const getClinicsForProvince = () => {
    if (isHomePharmaChecked && selectedProvince) {
      return Object.keys(clinicsDataHomepharma[selectedProvince] || {}).map(
        (clinicKey) => ({
          label: clinicKey,
          value: clinicKey,
        }),
      );
    }

    if (isIcnChecked && selectedProvince) {
      return Object.keys(clinicsDataInfusion[selectedProvince] || {}).map(
        (clinicKey) => ({
          label: clinicKey,
          value: clinicKey,
        }),
      );
    }

    return [];
  };

  // 2. Render the UI with checkboxes
  return (
    <>
      <Heading level={3}>Please Select Billing</Heading>
      <BlockSpacer spacing="base" />
      <InlineStack>
        <Checkbox
          id="checkbox-pss"
          name="checkbox-pss"
          onChange={handlePssChange}
          label="PSS"
          value="pss"
          checked={isPssChecked}
        >
          PSS
        </Checkbox>
        <Checkbox
          id="checkbox-home-pharma"
          name="checkbox-home-pharma"
          onChange={handleHomePharmaChange}
          label="Home Pharma"
          value="home-pharma"
          checked={isHomePharmaChecked}
        >
          Home Pharma
        </Checkbox>
        <Checkbox
          id="checkbox-infusion-clinic"
          name="checkbox-infusion-clinic"
          onChange={handleIcnChange}
          label="Infusion Clinic"
          value="infusion-clinic"
          checked={isIcnChecked}
        >
          Infusion Clinic
        </Checkbox>
      </InlineStack>

      {/* Show two input fields when PSS is selected */}
      {isPssChecked && (
        <>
          <BlockSpacer spacing="base" />
          <Heading level={4}>PSS</Heading>
          <BlockSpacer spacing="base" />
          <TextField label="PSS Program Name" name="pss-program-name" />
          <TextField label="Patient ID" name="patient-id" />
        </>
      )}

      {/* Show a dropdown when either Home Pharma or ICN is selected */}
      {(isHomePharmaChecked || isIcnChecked) && (
        <>
          <BlockSpacer spacing="base" />
          <Heading level={4}>
            {isHomePharmaChecked ? "Home Pharma" : "Infusion Clinic"}
          </Heading>
          <BlockSpacer spacing="base" />
          <Select
            label="Select Province"
            options={Object.entries(provinceList).map(([key, province]) => ({
              label: province,
              value: province,
            }))}
            value={selectedProvince}
            onChange={handleProvinceChange}
          />
        </>
      )}

      {/* Clinic Select Dropdown based on the selected province */}
      {selectedProvince && (
        <Select
          label="Select Clinic"
          options={getClinicsForProvince()}
          value={selectedClinic}
          onChange={handleClinicChange}
        />
      )}
      <BlockSpacer spacing="loose" />
      <Divider />
    </>
  );

  // Handlers for checkbox changes
  function handlePssChange(isChecked) {
    setIsPssChecked(isChecked);
  }

  function handleHomePharmaChange(isChecked) {
    if (isChecked) {
      setIsIcnChecked(false); // Uncheck Infusion Clinic if Home Pharma is checked
      setSelectedProvince("");
    }
    setIsHomePharmaChecked(isChecked);
  }

  function handleIcnChange(isChecked) {
    if (isChecked) {
      setIsHomePharmaChecked(false); // Uncheck Home Pharma if Infusion Clinic is checked
      setSelectedProvince("");
    }
    setIsIcnChecked(isChecked);
  }
}
