import { useState } from 'react'

const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault()
    const validationErrors = validate ? validate(values) : {}

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSubmit(values)
  }

  return { values, errors, handleChange, handleSubmit, setValues, setErrors }
}

export default useForm
