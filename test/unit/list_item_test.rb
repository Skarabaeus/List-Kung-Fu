require 'test_helper'

class ListItemTest < ActiveSupport::TestCase
  test "needs at least a list" do
    assert_raise( ActiveRecord::RecordInvalid ) do
      f = ListItem.new
      f.save!
    end
  end
end
