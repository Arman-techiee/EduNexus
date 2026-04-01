import { useState } from 'react'
import Alert from '../../components/Alert'
import useForm from '../../hooks/useForm'
import api from '../../utils/api'
import { getFriendlyErrorMessage } from '../../utils/errors'

const StudentIntakeForm = () => {
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { values, errors, handleChange, handleSubmit, setValues } = useForm({
    fullName: '',
    email: '',
    phone: '',
    fatherName: '',
    motherName: '',
    fatherPhone: '',
    motherPhone: '',
    bloodGroup: '',
    localGuardianName: '',
    localGuardianAddress: '',
    localGuardianPhone: '',
    permanentAddress: '',
    temporaryAddress: '',
    dateOfBirth: '',
    preferredDepartment: ''
  }, (formValues) => {
    const validationErrors = {}
    ;[
      'fullName',
      'email',
      'phone',
      'fatherName',
      'motherName',
      'fatherPhone',
      'motherPhone',
      'localGuardianName',
      'localGuardianAddress',
      'localGuardianPhone',
      'permanentAddress',
      'temporaryAddress',
      'dateOfBirth',
      'preferredDepartment'
    ].forEach((field) => {
      if (!String(formValues[field] || '').trim()) validationErrors[field] = 'This field is required'
    })
    return validationErrors
  })

  const onSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await api.post('/auth/student-intake', values)
      setSuccess('Your student details have been submitted successfully. The institution can now review them and create your account.')
      setValues({
        fullName: '',
        email: '',
        phone: '',
        fatherName: '',
        motherName: '',
        fatherPhone: '',
        motherPhone: '',
        bloodGroup: '',
        localGuardianName: '',
        localGuardianAddress: '',
        localGuardianPhone: '',
        permanentAddress: '',
        temporaryAddress: '',
        dateOfBirth: '',
        preferredDepartment: ''
      })
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError, 'Unable to submit your form right now.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Intake Form</h1>
          <p className="mt-2 text-sm text-gray-500">Share this sample form link with newly admitted first-semester students so they can submit their details before you create their portal account.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <Alert type="success" message={success} />
          <Alert type="error" message={error} />

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <input name="fullName" value={values.fullName} onChange={handleChange} placeholder="Full Name" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName}</p> : null}
            </div>
            <div>
              <input name="email" type="email" value={values.email} onChange={handleChange} placeholder="Personal Email" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>
            <div>
              <input name="phone" value={values.phone} onChange={handleChange} placeholder="Phone Number" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
            </div>
            <div>
              <input name="fatherName" value={values.fatherName} onChange={handleChange} placeholder="Father Name" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.fatherName ? <p className="mt-1 text-xs text-red-600">{errors.fatherName}</p> : null}
            </div>
            <div>
              <input name="motherName" value={values.motherName} onChange={handleChange} placeholder="Mother Name" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.motherName ? <p className="mt-1 text-xs text-red-600">{errors.motherName}</p> : null}
            </div>
            <div>
              <input name="fatherPhone" value={values.fatherPhone} onChange={handleChange} placeholder="Father Contact Number" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.fatherPhone ? <p className="mt-1 text-xs text-red-600">{errors.fatherPhone}</p> : null}
            </div>
            <div>
              <input name="motherPhone" value={values.motherPhone} onChange={handleChange} placeholder="Mother Contact Number" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.motherPhone ? <p className="mt-1 text-xs text-red-600">{errors.motherPhone}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">DOB</label>
              <input name="dateOfBirth" type="date" value={values.dateOfBirth} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.dateOfBirth ? <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p> : null}
            </div>
            <div>
              <input name="preferredDepartment" value={values.preferredDepartment} onChange={handleChange} placeholder="Department" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.preferredDepartment ? <p className="mt-1 text-xs text-red-600">{errors.preferredDepartment}</p> : null}
            </div>
            <div>
              <input name="bloodGroup" value={values.bloodGroup} onChange={handleChange} placeholder="Blood Group (optional)" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
            </div>
            <div>
              <input name="localGuardianName" value={values.localGuardianName} onChange={handleChange} placeholder="Local Guardian Name" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.localGuardianName ? <p className="mt-1 text-xs text-red-600">{errors.localGuardianName}</p> : null}
            </div>
            <div>
              <input name="localGuardianPhone" value={values.localGuardianPhone} onChange={handleChange} placeholder="Local Guardian Contact Number" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.localGuardianPhone ? <p className="mt-1 text-xs text-red-600">{errors.localGuardianPhone}</p> : null}
            </div>
            <div className="md:col-span-2">
              <textarea name="localGuardianAddress" value={values.localGuardianAddress} onChange={handleChange} placeholder="Local Guardian Address" rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.localGuardianAddress ? <p className="mt-1 text-xs text-red-600">{errors.localGuardianAddress}</p> : null}
            </div>
            <div className="md:col-span-2">
              <textarea name="permanentAddress" value={values.permanentAddress} onChange={handleChange} placeholder="Permanent Address" rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.permanentAddress ? <p className="mt-1 text-xs text-red-600">{errors.permanentAddress}</p> : null}
            </div>
            <div className="md:col-span-2">
              <textarea name="temporaryAddress" value={values.temporaryAddress} onChange={handleChange} placeholder="Temporary Address" rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
              {errors.temporaryAddress ? <p className="mt-1 text-xs text-red-600">{errors.temporaryAddress}</p> : null}
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Student Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentIntakeForm
