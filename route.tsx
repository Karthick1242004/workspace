case "multiselect":
      return (
        <Controller
          name={field.name}
          control={control}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: { value, onChange } }) => (
            <MultipleSelector
              value={value}
              onChange={onChange}
              options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
              placeholder={`Select ${field.label}`}
              className="bg-white border-gray-200 !text-xs"
            />
          )}
        />
      );
