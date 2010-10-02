require 'test_helper'

class ListTest < ActiveSupport::TestCase
  test "needs at least a title" do
    assert_raise( ActiveRecord::RecordInvalid ) do
      f = List.new
      f.owner = Factory(:user)
      f.save!
    end
  end
  
  test "needs at least an owner" do
    assert_raise( ActiveRecord::RecordInvalid ) do
      f = List.new
      f.title = "test list"
      f.save!
    end
  end
end
