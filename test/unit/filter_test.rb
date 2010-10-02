require 'test_helper'

class FilterTest < ActiveSupport::TestCase

  test "needs at least a name" do
    assert_raise( ActiveRecord::RecordInvalid ) do
      f = Filter.new
      f.user = Factory(:user)
      f.save!
    end
  end
  
  test "needs at least an associated user" do
    assert_raise( ActiveRecord::RecordInvalid ) do
      f = Filter.new
      f.name = "test"
      f.save!      
    end
  end
end
